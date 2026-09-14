/// <reference types="node" />

/** 专辑封面缓存：同一个 songMid 只查一次 */
const coverCache = new Map<string, string | null>();

/** 上一次成功拿到的完整回包（JSON 字符串）。 */
let cachedBody: { at: number; body: string } | null = null;

/** 并发去重 + 后台刷新：同一时刻只打一次上游 */
let inflight: Promise<string | null> | null = null;

/**
 * 上游 a.y.qq.com 报告接口的超时。
 *
 * 必须明显小于平台函数上限（Vercel Hobby 默认 10s），否则冷启动时函数会被
 * 直接掐断返回 504，前端拿到的就不是 JSON —— 表现就是「第一次不显示，
 * 刷新一次才显示」。所以这里给一个保守值。
 */
const REPORT_TIMEOUT_MS = 4000;
/** 单首歌曲封面接口超时 */
const COVER_TIMEOUT_MS = 2500;
/**
 * 封面抓取的时间预算。封面只是锦上添花，不能拖慢报告本身：
 * 超过这个时间就先返回不带封面的数据，剩下的封面会在后续请求里补齐。
 */
const COVER_BUDGET_MS = 600;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchCover(songMid: string): Promise<string | null> {
  try {
    const payload = encodeURIComponent(
      JSON.stringify({
        comm: { ct: 24 },
        req: {
          module: "music.pf_song_detail_svr",
          method: "get_song_detail_yqq",
          param: { song_mid: songMid },
        },
      })
    );
    const res = await fetch(
      `https://u.y.qq.com/cgi-bin/musicu.fcg?format=json&data=${payload}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
          Referer: "https://y.qq.com/",
        },
        signal: AbortSignal.timeout(COVER_TIMEOUT_MS),
      }
    );
    if (!res.ok) return null;
    const json: any = await res.json();
    const albumMid = json?.req?.data?.track_info?.album?.mid;
    return albumMid
      ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albumMid}.jpg`
      : null;
  } catch {
    return null;
  }
}

async function enrichCovers(data: any): Promise<void> {
  const m = data?.monthData;
  if (!m) return;

  const mids = new Set<string>();
  for (const s of m.topSong ?? []) if (s?.songMid) mids.add(s.songMid);
  for (const t of m.topDataList ?? []) {
    if (t?.repeatSong?.songMid) mids.add(t.repeatSong.songMid);
    if (t?.midnightSong?.songMid) mids.add(t.midnightSong.songMid);
    if (t?.favSongMid) mids.add(t.favSongMid);
  }

  const unique = [...mids];
  const results = await Promise.all(
    unique.map(async (mid) => {
      const cached = coverCache.get(mid);
      if (cached !== undefined) return [mid, cached] as const;
      const url = await fetchCover(mid);
      coverCache.set(mid, url);
      return [mid, url] as const;
    })
  );
  const map = new Map(results);

  for (const s of m.topSong ?? []) {
    const c = s?.songMid ? map.get(s.songMid) : undefined;
    if (c) s.cover = c;
  }
  for (const t of m.topDataList ?? []) {
    const rc = t?.repeatSong?.songMid ? map.get(t.repeatSong.songMid) : undefined;
    if (rc) t.repeatSong.cover = rc;
    const mc = t?.midnightSong?.songMid ? map.get(t.midnightSong.songMid) : undefined;
    if (mc) t.midnightSong.cover = mc;
    const fc = t?.favSongMid ? map.get(t.favSongMid) : undefined;
    if (fc) t.favSongCover = fc;
  }
}

/** 只打一次上游，成功则返回序列化好的回包 */
async function buildPayload(apiKey: string): Promise<string | null> {
  const res = await fetch("https://a.y.qq.com/me/report", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      params: { timeKey: "m" },
      comm: { skill_version: "0.0.3" },
    }),
    signal: AbortSignal.timeout(REPORT_TIMEOUT_MS),
  });
  if (!res.ok) return null;

  const data: any = await res.json();
  if (!data?.monthData) return null;

  // 封面最多等 COVER_BUDGET_MS，超时也照样把报告返回去
  await Promise.race([
    enrichCovers(data).catch(() => undefined),
    sleep(COVER_BUDGET_MS),
  ]);
  return JSON.stringify(data);
}

/** 启动一次后台刷新；已有请求在飞就直接复用（single flight） */
function startRefresh(apiKey: string): Promise<string | null> {
  if (!inflight) {
    inflight = buildPayload(apiKey)
      .then((body) => {
        if (body) cachedBody = { at: Date.now(), body };
        return body;
      })
      .catch(() => null)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/**
 * 取一份可用的听歌报告 JSON 字符串。
 *
 * 关键点：**用户能看到的这条请求路径永远不等上游**。
 *
 * - `maxAgeMs` 内的缓存直接命中；
 * - 有旧数据时立刻返回旧数据，同时在后台静默刷新（stale-while-revalidate），
 *   这样刷新页面/切换路由都不会再出现「第一次空白」；
 * - 只有「从来没有成功过」时才阻塞等一次上游，且被 `REPORT_TIMEOUT_MS` 兜住；
 * - 上游失败时回退到上一次成功的数据；
 * - 返回 `null` 表示从来没有成功过（例如没配 API Key）。
 */
export async function getQqMusicPayload(
  apiKey: string,
  maxAgeMs = 300_000
): Promise<string | null> {
  if (!apiKey) return null;

  // 1) 缓存还新鲜：直接命中，完全不碰上游
  //    用局部快照读取，避免 TS 控制流把 cachedBody 收窄成 null
  const hit = cachedBody;
  if (hit && Date.now() - hit.at < maxAgeMs) {
    return hit.body;
  }

  // 2) 有旧数据：先把旧数据交出去（保证首屏一定有内容），后台再刷新
  if (hit) {
    void startRefresh(apiKey);
    return hit.body;
  }

  // 3) 从来没成功过：只能等一次，但有超时上限
  const body = await startRefresh(apiKey);
  return body ?? cachedBody?.body ?? null;
}

export default async function handler(_req: any, res: any) {
  let body: string | null = null;
  try {
    body = await getQqMusicPayload(process.env.QQMUSIC_API_KEY || "");
  } catch {
    body = null;
  }

  if (!body) {
    // 返回 JSON 而不是空 body：前端能一眼看出是接口侧的问题
    res.statusCode = 502;
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "qq-music unavailable" }));
    return;
  }

  res.statusCode = 200;
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=86400"
  );
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(body);
}
