/// <reference types="node" />

const coverCache = new Map<string, string | null>();

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
        signal: AbortSignal.timeout(4000),
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

export async function loadQqMusicReport(apiKey: string): Promise<unknown | null> {
  if (!apiKey) return null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
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
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;
      const data: any = await res.json();
      await enrichCovers(data);
      return data;
    } catch {
      /* retry */
    }
  }
  return null;
}

export default async function handler(_req: any, res: any) {
  const data = await loadQqMusicReport(process.env.QQMUSIC_API_KEY || "");

  if (!data) {
    res.statusCode = 502;
    res.setHeader("Cache-Control", "no-store");
    res.end();
    return;
  }

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=600, stale-while-revalidate=3600"
  );
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}
