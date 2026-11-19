/// <reference types="node" />

/**
 * CodeTime 编程总时长代理。
 *
 * 为什么需要这一层：codetime.dev 的公开接口实测无需鉴权，但**不返回任何 CORS 头**，
 * 浏览器直连会被拦。前端只拿同源的 /api/codetime（开发环境由 vite 中间件顶上）。
 *
 * 返回 { label, message, seconds }：
 * - `message` 是上游原文（形如 "30hrs 57mins"），永远原样带出去；
 * - `seconds` 由 message 解析而来，解析不出就是 null —— 前端回退显示 message，
 *   上游哪天改文案也不会把整块徽章弄空。
 *
 * 缓存策略与 api/qq-music.ts 一致：命中就直接给，过期但有旧数据就先给旧数据
 * （stale-while-revalidate），保证页面永远不等第三方。
 */

const CODETIME_URL = "https://codetime.dev/v3/users/shield?uid=37245";
/** 上游超时，必须明显小于平台函数上限（Vercel Hobby 默认 10s） */
const UPSTREAM_TIMEOUT_MS = 4000;
/** 编程总时长变化很慢，缓存 10 分钟足够，也避免频繁打第三方 */
const CACHE_TTL_MS = 600_000;

let cached: { at: number; body: string } | null = null;
/** 并发去重：同一时刻只打一次上游 */
let inflight: Promise<string | null> | null = null;

/**
 * "30hrs 57mins" → 111420（秒）；识别不出单位就返回 null，交给前端回退。
 *
 * 单位后面用 `(?![a-z])` 而不是 `\b`：`\b` 在 "30hrs57mins" 这种无空格写法里，
 * `hrs` 后面紧跟数字、不构成词边界，会把小时那半整段丢掉。
 */
function parseMessage(message: string): number | null {
  const h = /(\d+)\s*h(?:rs?|ours?)?(?![a-z])/i.exec(message);
  const m = /(\d+)\s*m(?:ins?|inutes?)?(?![a-z])/i.exec(message);
  if (!h && !m) return null;
  return Number(h?.[1] ?? 0) * 3600 + Number(m?.[1] ?? 0) * 60;
}

async function buildPayload(): Promise<string | null> {
  const res = await fetch(CODETIME_URL, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!res.ok) return null;

  const data: any = await res.json();
  const message = typeof data?.message === "string" ? data.message.trim() : "";
  if (!message) return null;

  return JSON.stringify({
    label: typeof data?.label === "string" && data.label ? data.label : "CodeTime",
    message,
    seconds: parseMessage(message),
  });
}

/** 启动一次后台刷新；已有请求在飞就直接复用（single flight） */
function startRefresh(): Promise<string | null> {
  if (!inflight) {
    inflight = buildPayload()
      .then((body) => {
        if (body) cached = { at: Date.now(), body };
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
 * 取一份可用的 CodeTime JSON 字符串。
 * 返回 null 表示上游不可用且从来没有成功过。
 */
export async function getCodetimePayload(
  maxAgeMs = CACHE_TTL_MS
): Promise<string | null> {
  // 用局部快照读取，避免 TS 控制流把 cached 收窄成 null
  const hit = cached;
  if (hit && Date.now() - hit.at < maxAgeMs) return hit.body;

  // 过期但有旧数据：先交出去，后台再刷新
  if (hit) {
    void startRefresh();
    return hit.body;
  }

  return (await startRefresh()) ?? cached?.body ?? null;
}

export default async function handler(_req: any, res: any) {
  let body: string | null = null;
  try {
    body = await getCodetimePayload();
  } catch {
    body = null;
  }

  if (!body) {
    res.statusCode = 502;
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "codetime unavailable" }));
    return;
  }

  res.statusCode = 200;
  res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=86400");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(body);
}
