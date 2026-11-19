<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

interface QqSong {
  songName: string;
  singerName: string;
  songMid: string;
  cover?: string;
  /** 本月播放次数 */
  sum?: number;
}

interface QqMonthTop {
  month?: string;
  favSongMid?: string;
  favSongName?: string;
  favSingerName?: string;
  favSongCover?: string;
  repeatSong?: { songName?: string; songMid?: string; count?: number; cover?: string };
  midnightSong?: { songName?: string; songMid?: string; hour?: number; cover?: string };
}

interface QqReport {
  /** 服务端从 QQ 拉取这份数据的时刻，由 api/qq-music.ts 注入 */
  updatedAt?: number;
  monthData?: {
    topSong?: QqSong[];
    topSinger?: { singerName: string; singerMid: string; sum?: number }[];
    topDataList?: QqMonthTop[];
    topGenre?: { genre2Count?: { name: string; sum: number }[] };
    preferHour?: { preferHour?: number };
    consDays?: { conDays?: number; topListen?: number; singerDay?: { singerName?: string } };
    monthDetailList?: { dataTime?: string; listenCount?: number }[];
  };
}

const qqData = ref<QqReport | null>(null);
const musicLoading = ref(true);
const musicError = ref(false);
const musicErrorDetail = ref("");

/* 本地缓存：先渲染上次的数据，再向后端要最新的，避免首屏空白。
   刻意不设过期时间——哪怕数据是旧的也先显示出来，随后静默更新，
   这样只有「这辈子第一次访问」才会真正看到加载态。 */
const QQ_CACHE_KEY = "qq-music-report:v1";

function readMusicCache(): QqReport | null {
  try {
    const raw = localStorage.getItem(QQ_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at?: number; data?: QqReport };
    if (!parsed?.data?.monthData) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeMusicCache(data: QqReport) {
  try {
    localStorage.setItem(QQ_CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* 无痕模式 / 超出配额，忽略即可 */
  }
}

/** 兼容不支持 AbortSignal.timeout 的环境（旧 Safari） */
function timeoutSignal(ms: number): AbortSignal | undefined {
  if (
    typeof AbortSignal !== "undefined" &&
    typeof AbortSignal.timeout === "function"
  ) {
    return AbortSignal.timeout(ms);
  }
  if (typeof AbortController === "undefined") return undefined;
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

/**
 * 首次访问时后端可能是冷启动（Serverless 函数还要再去请求上游），
 * 单次请求偶发超时很正常，所以多给几次机会，整体覆盖约 15s。
 */
const MUSIC_RETRY_DELAYS = [0, 1500, 4000];
const MUSIC_ATTEMPT_TIMEOUT_MS = 8000;

async function loadMusic() {
  // 有本地缓存就先渲染旧数据，不要闪骨架屏
  if (!qqData.value) qqData.value = readMusicCache();
  musicLoading.value = !qqData.value;
  musicError.value = false;
  musicErrorDetail.value = "";

  let lastDetail = "";

  for (const delay of MUSIC_RETRY_DELAYS) {
    if (delay) await new Promise((r) => setTimeout(r, delay));
    try {
      const res = await fetch("/api/qq-music", {
        signal: timeoutSignal(MUSIC_ATTEMPT_TIMEOUT_MS),
        cache: "no-store",
      });
      const type = res.headers.get("content-type") || "";
      if (res.ok && type.includes("application/json")) {
        const data = (await res.json()) as QqReport;
        if (data?.monthData) {
          qqData.value = data;
          writeMusicCache(data);
          musicLoading.value = false;
          musicError.value = false;
          musicErrorDetail.value = "";
          return;
        }
        lastDetail = "返回数据为空";
      } else {
        lastDetail = `接口返回 HTTP ${res.status}`;
      }
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      lastDetail =
        name === "TimeoutError" || name === "AbortError" ? "请求超时" : "网络错误";
    }
  }

  musicLoading.value = false;
  // 已经有缓存的旧数据时不算失败，继续展示旧数据就行
  musicError.value = !qqData.value;
  musicErrorDetail.value = musicError.value ? lastDetail : "";
}

/** 时间戳 → 2026-09-14 20:24:03（访问者本地时区）；拿不到或不合法就返回空串 */
function formatStamp(ms: number): string {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** 秒 → 时长文案：不足 1 小时显示「N 分钟」，否则「X.X 小时」（对齐 skill 文档 me.md 的换算规则） */
function formatDuration(sec: number): string {
  const minutes = Math.round(sec / 60);
  if (minutes < 60) return `${minutes} 分钟`;
  return `${(sec / 3600).toFixed(1)} 小时`;
}

const music = computed(() => {
  const m = qqData.value?.monthData;
  if (!m) return null;

  const songs = (m.topSong ?? []).slice(0, 5).map((s) => ({
    name: s.songName,
    sub: s.singerName,
    href: `https://i2.y.qq.com/a/song/${s.songMid}`,
    cover: s.cover,
    count: s.sum ? `${s.sum.toLocaleString("en-US")} 次` : undefined,
  }));

  const singers = (m.topSinger ?? []).slice(0, 5).map((s) => ({
    name: s.singerName,
    href: `https://i2.y.qq.com/a/singer/${s.singerMid}`,
    avatar: s.singerMid
      ? `https://y.gtimg.cn/music/photo_new/T001R300x300M000${s.singerMid}.jpg`
      : undefined,
    // topSinger 的 sum 是「时长（秒）」，不是次数 —— 见 skill 文档 me.md：歌手条目 sum = 时长，
    // 歌曲条目 sum = 次数。直接甩 23234 会被读成 23234 次播放（整月也才 284 次），必须换算
    count: s.sum ? formatDuration(s.sum) : undefined,
  }));

  const genres = (m.topGenre?.genre2Count ?? [])
    .slice()
    .sort((a, b) => b.sum - a.sum)
    .slice(0, 1)
    .map((g) => g.name);

  const songHref = (mid?: string) =>
    mid ? `https://i2.y.qq.com/a/song/${mid}` : undefined;

  const tops = m.topDataList ?? [];
  const withRepeat = tops.filter((t) => t.repeatSong?.songName);
  const repeatEntry = (withRepeat.length ? withRepeat : tops)
    .slice()
    .sort((a, b) => (b.month ?? "").localeCompare(a.month ?? ""))[0];

  const bests: { label: string; value: string; sub?: string; href?: string; cover?: string }[] = [];
  if (repeatEntry?.repeatSong?.songName) {
    bests.push({
      label: "单曲循环之最",
      value: repeatEntry.repeatSong.songName,
      sub: `循环 ${repeatEntry.repeatSong.count ?? "?"} 次`,
      href: songHref(repeatEntry.repeatSong.songMid),
      cover: repeatEntry.repeatSong.cover,
    });
  }
  if (repeatEntry?.midnightSong?.songName) {
    bests.push({
      label: "深夜单曲",
      value: repeatEntry.midnightSong.songName,
      sub: `${repeatEntry.midnightSong.hour ?? 0} 点`,
      href: songHref(repeatEntry.midnightSong.songMid),
      cover: repeatEntry.midnightSong.cover,
    });
  }
  if (repeatEntry?.favSongName) {
    bests.push({
      label: "月度最爱",
      value: repeatEntry.favSongName,
      sub: repeatEntry.favSingerName,
      href: songHref(repeatEntry.favSongMid),
      cover: repeatEntry.favSongCover,
    });
  }
  if (m.consDays?.topListen) {
    bests.push({
      label: "单日最多听歌",
      value: `${m.consDays.topListen} 首`,
      sub: m.consDays.singerDay?.singerName
        ? `连续最多 · ${m.consDays.singerDay.singerName}`
        : undefined,
    });
  }

  const months = m.monthDetailList ?? [];
  const totalListens = months.reduce((n, d) => n + (d.listenCount ?? 0), 0);
  const hour = m.preferHour?.preferHour;

  // 底部数据条：值在上、标签在下
  const stats: { label: string; value: string; unit?: string }[] = [];
  if (totalListens) {
    stats.push({
      label: "累计听歌",
      value: totalListens.toLocaleString("en-US"),
      unit: "次",
    });
  }
  if (genres.length) {
    stats.push({ label: "偏爱流派", value: genres.join(" / ") });
  }
  if (hour !== undefined) {
    stats.push({ label: "最爱时段", value: String(hour), unit: "点" });
  }

  // 取不到就返回空串，模板里 v-if 会把整行隐藏 ——
  // 部署后 CDN 可能还留着没有 updatedAt 的旧回包，不能显示成 1970 或 Invalid Date
  const updatedAtText = qqData.value?.updatedAt
    ? formatStamp(qqData.value.updatedAt)
    : "";

  return {
    songs,
    singers,
    bests,
    stats,
    updatedAtText,
  };
});

onMounted(loadMusic);
</script>

<template>
    <section v-if="music || musicLoading || musicError" class="about-section">
      <h2 class="section-title">MUSIC</h2>
      <p class="section-sub">本月 QQ 音乐听歌报告</p>

      <div v-if="!music" class="music-placeholder">
        <template v-if="musicLoading">
          <span v-for="n in 4" :key="n" class="music-skeleton" />
        </template>
        <p v-else class="music-failed">
          听歌数据暂时没取到<template v-if="musicErrorDetail">（{{ musicErrorDetail }}）</template>
          <button type="button" class="music-retry" @click="loadMusic">重新加载</button>
        </p>
      </div>

      <template v-else>
      <div class="music-grid">
        <div class="music-col">
          <p class="music-col-title">常听歌手</p>
          <ul class="music-list">
            <li v-for="(s, i) in music.singers" :key="s.name">
              <img v-if="s.avatar" :src="s.avatar" alt="" class="music-avatar" loading="lazy" />
              <span class="music-rank">{{ i + 1 }}</span>
              <a :href="s.href" target="_blank" rel="noopener noreferrer" class="music-name" :title="s.name">{{ s.name }}</a>
              <span v-if="s.count" class="music-count">{{ s.count }}</span>
            </li>
          </ul>
        </div>
        <div class="music-col">
          <p class="music-col-title">常听歌曲</p>
          <ul class="music-list">
            <li v-for="(s, i) in music.songs" :key="s.name">
              <img v-if="s.cover" :src="s.cover" alt="" class="music-cover" loading="lazy" />
              <span class="music-rank">{{ i + 1 }}</span>
              <a :href="s.href" target="_blank" rel="noopener noreferrer" class="music-name" :title="s.name">{{ s.name }}</a>
              <span class="music-sub">{{ s.sub }}</span>
              <span v-if="s.count" class="music-count">{{ s.count }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="music.bests.length" class="music-bests">
        <div v-for="b in music.bests" :key="b.label" class="best-card">
          <img v-if="b.cover" :src="b.cover" alt="" class="best-cover" loading="lazy" />
          <div class="best-body">
            <span class="best-label">{{ b.label }}</span>
            <a
              v-if="b.href"
              :href="b.href"
              target="_blank"
              rel="noopener noreferrer"
              class="best-value best-value--link"
            >{{ b.value }}</a>
            <span v-else class="best-value">{{ b.value }}</span>
            <span v-if="b.sub" class="best-sub">{{ b.sub }}</span>
          </div>
        </div>
      </div>

      <div v-if="music.stats.length" class="music-stats">
        <div v-for="s in music.stats" :key="s.label" class="music-stat">
          <div class="music-stat-value" :title="s.value + (s.unit || '')">
            {{ s.value }}<span v-if="s.unit" class="music-stat-unit">{{ s.unit }}</span>
          </div>
          <div class="music-stat-label">{{ s.label }}</div>
        </div>
      </div>

      <p v-if="music.updatedAtText" class="music-updated">数据更新于 {{ music.updatedAtText }}</p>
      </template>
    </section>
</template>

<style scoped>
/* ===== QQ 音乐 ===== */

.music-placeholder {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.music-skeleton {
  height: 70px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  animation: music-pulse 1.2s ease-in-out infinite;
}

@keyframes music-pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

.music-failed {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-tertiary);
}

.music-retry {
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--accent);
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.music-retry:hover {
  border-color: rgba(var(--accent-rgb), 0.4);
  background: rgba(var(--accent-rgb), 0.05);
}

.music-bests {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.best-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-secondary);
  min-width: 0;
}

.best-cover {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.best-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.best-label {
  font-size: 0.72rem;
  color: var(--text-tertiary);
  letter-spacing: 0.02em;
}

.best-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.best-value--link {
  color: var(--accent);
  text-decoration: none;
}

.best-value--link:hover {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.best-sub {
  font-size: 0.75rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.music-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.music-col {
  grid-column: span 2;
  min-width: 0;
}

.music-col-title {
  margin: 0 0 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-align: center;
}

/* 列表铺满各自那半列：两列宽度天生一致，左右边界也对齐；
   次数用 margin-left: auto 对齐到列右边缘，因此两列的数字都成一列 */
.music-list {
  list-style: none;
  width: 100%;
  margin: 0;
  padding: 0;
}

.music-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  min-width: 0;
}

.music-rank {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(var(--accent-rgb), 0.12);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-variant-numeric: tabular-nums;
}

.music-cover {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.music-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.music-name {
  font-size: 1rem;
  color: var(--text);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.music-name:hover {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.music-sub {
  flex-shrink: 0;
  font-size: 0.82rem;
  color: var(--text-tertiary);
}

/* 行尾的次数：推到最右，等宽数字避免各行上下抖动 */
.music-count {
  flex-shrink: 0;
  margin-left: auto;
  font-size: 0.82rem;
  color: var(--text-tertiary);
  font-variant-numeric: tabular-nums;
}

/* 底部数据条：三条统计，值在上、标签在下，三格等分且各自居中，中间 1px 竖分隔。
   用 GitHub 数据卡（.gh-card）那套配方给它一个承载面 —— 否则一条裸 border-top
   浮在区块末尾，和上面几张带边框的卡片不成一体 */
.music-stats {
  display: flex;
  align-items: flex-start;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card-bg);
  padding: 18px 20px;
}

.music-stat {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  padding: 0 16px;
  /* 三格等分，数值与标签各自在本格居中。
     注意不能再有 :first-child { padding-left: 0 } —— 那是左对齐时代为了
     让首格贴齐标题左边缘加的，一旦居中，这个不对称内边距会把第一格推偏 8px */
  text-align: center;
}

.music-stat + .music-stat::before {
  content: "";
  position: absolute;
  left: 0;
  top: 2px;
  bottom: 2px;
  width: 1px;
  background: var(--border);
}

/* 数值用页面自己的 accent（对齐写作统计的 .ws-num：1.5rem / 800 / accent）—— 数字响、其余静 */
.music-stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.1;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 标签提到二级灰：三级灰在这个底色上只有 2.85:1（深色约 3.15:1），低于正文可读标准 */
.music-stat-label {
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--text-secondary);
  margin-top: 5px;
  white-space: nowrap;
}

.music-stat-unit {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-tertiary);
  margin-left: 3px;
}

/* 数据抓取时刻：写法对齐页面已有的 .runtime（小字 + 三级灰 + 居中） */
.music-updated {
  margin: 12px 0 0;
  text-align: center;
  font-size: 0.82rem;
  color: var(--text-tertiary);
}

@media (max-width: 500px) {
  .music-bests {
    grid-template-columns: repeat(2, 1fr);
  }
  .music-placeholder {
    grid-template-columns: repeat(2, 1fr);
  }
  .music-grid {
    grid-template-columns: 1fr;
  }
  .music-col {
    grid-column: auto;
  }
  /* 单列下每行只剩约 327px，缩略图退回页面原有的 34px 量级，给歌名留宽度 */
  .music-cover,
  .music-avatar {
    width: 34px;
    height: 34px;
  }
  .music-list li {
    padding: 6px 0;
  }
  /* 窄屏收一档：流派名是文字（最长可能 4 个汉字），1.5rem 会被省略号截掉。
     面板内边距也要收，否则 375px 下三格每格只剩约 75px，装不下「1,946 次」 */
  .music-stats {
    padding: 14px 12px;
  }
  .music-stat {
    padding: 0 10px;
  }
  .music-stat-value {
    font-size: 1.3rem;
  }
}

/* 宽屏才收：两列各自在自己的半列里再窄一档。两列同值，所以仍然等宽、数字仍对齐。
   用 px 而不是百分比 —— 容器是 max-width:760px，视口一窄每列就跟着窄
   （视口 700px 时每列仅约 321px），百分比会继续按比例压缩、白白截断长歌名；
   px 上限在列宽本身不足时自动失效，不会雪上加霜。
   320px 由最长歌名那一行决定，再窄 Rolling in the Deep 就会被省略号截断 */
@media (min-width: 501px) {
  .music-list {
    max-width: 320px;
    margin: 0 auto;
  }
}
</style>
