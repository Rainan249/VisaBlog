<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import CursorTrail from "../components/CursorTrail.vue";
import avatar from "../assets/头像.jpg";
import { getAllPosts, getAllPostsWithContent } from "../lib/posts";
import { burstConfetti } from "../lib/confetti";
import {
  siSpringboot,
  siVuedotjs,
  siMysql,
  siPython,
  siVite,
  siNodedotjs,
  siIntellijidea,
  siWebstorm,
  siPycharm,
  siGit,
  siGithub,
  siVercel,
  siGooglechrome,
  siObsidian,
  siDeepseek,
  siClaudecode,
  type SimpleIcon,
} from "simple-icons";

const START_DATE = "2026-07-16T14:30:00";
const timeText = ref("");

const ghStats = ref<{ followers: number | null; repos: number | null }>({
  followers: null,
  repos: null,
});

function onSpoilerClick(e: MouseEvent) {
  burstConfetti(e.clientX, e.clientY);
}

/**
 * 图标其实只用到 path 和 hex 两个字段，所以放宽成 SimpleIcon 的子集：
 * simple-icons 里没有 OpenAI 系图标（实测 cdn.simpleicons.org/openai 是 404），
 * Codex 那条得用别处取的 24×24 path 手写一个。
 */
type ToolIcon = Pick<SimpleIcon, "path" | "hex">;

interface ToolItem {
  icon: ToolIcon;
  name: string;
  desc: string;
  color?: string;
  /** 深色模式下的图标色：品牌色是纯黑的图标（GitHub / Vercel）必须给，否则深色下整块消失 */
  colorDark?: string;
}

/** 图标颜色交给 CSS 变量，好让 :root.dark 覆盖；缺省一律用品牌色 */
function iconStyle(t: ToolItem) {
  const base = t.color || `#${t.icon.hex}`;
  return { "--icon-color": base, "--icon-color-dark": t.colorDark || base };
}

/**
 * Java 咖啡杯。simple-icons 已下架 Java / Oracle，只剩 siOpenjdk —— 那画的是 OpenJDK
 * 自己的标记，不是 Java 那个咖啡杯。这里改用 MDI 的 language-java：24×24 单路径，
 * 正好配模板里写死的 viewBox="0 0 24 24"。
 */
const javaMark: ToolIcon = {
  path: "M16.5 6.08s-6.84 1.71-3.56 5.48c.97 1.11-.25 2.11-.25 2.11s2.45-1.25 1.31-2.85c-1.06-1.47-1.86-2.2 2.5-4.74m-4.47 1.2C16.08 4.08 14 2 14 2c.84 3.3-2.96 4.3-4.33 6.36c-.94 1.4.46 2.91 2.33 4.64c-.71-1.7-3.22-3.16.03-5.72M9.37 17.47c-3.08.86 1.88 2.63 5.79.96c-.38-.15-.75-.33-1.1-.54c-1.36.31-2.76.37-4.14.18c-1.31-.16-.55-.6-.55-.6m5.32-1.68c-1.75.38-3.56.47-5.34.26c-1.31-.13-.45-.77-.45-.77c-3.4 1.13 1.88 2.4 6.6 1.02c-.29-.11-.57-.3-.81-.51m3.42 3.3s.57.47-.61.83c-2.28.68-9.43.89-11.41.03c-.71-.31.63-.74 1.05-.83c.23-.06.46-.08.69-.08c-.79-.54-5.13 1.1-2.19 1.56c7.97 1.3 14.54-.6 12.47-1.51m-2.74-4.86c.29-.19.6-.35.92-.49c0 0-1.51.26-3.02.4c-1.6.16-3.21.18-4.81.06c-2.35-.31 1.29-1.2 1.29-1.2c-1.1 0-2.18.26-3.16.75c-2.05 1 5.1 1.45 8.78.48m.9 2.42c-.02.04-.04.07-.08.1c5.01-1.31 3.17-4.64.77-3.81c-.13.06-.24.14-.31.25c.14-.05.28-.09.43-.12c1.2-.24 2.92 1.63-.81 3.58m.13 4.61c-3.01.52-6.09.56-9.12.14c0 0 .46.38 2.81.53c3.6.23 9.13-.13 9.26-1.83c.03.01-.23.65-2.95 1.16",
  hex: "5382a1",
};

const techStack: ToolItem[] = [
  // 钢蓝 #5382a1 是官方 logos/java 里实测的填充色，白底 4.14:1、深底 3.84:1，两边都过 3:1，
  // 所以不需要 colorDark
  { icon: javaMark, name: "Java", desc: "主力后端语言", color: "#5382a1" },
  { icon: siSpringboot, name: "Spring Boot", desc: "Java 后端框架" },
  { icon: siVuedotjs, name: "Vue 3", desc: "前端框架" },
  { icon: siMysql, name: "MySQL", desc: "关系型数据库" },
  { icon: siPython, name: "Python", desc: "脚本 & 数据处理" },
  { icon: siVite, name: "Vite", desc: "构建工具" },
  { icon: siNodedotjs, name: "Node.js", desc: "JavaScript 运行时" },
];

/**
 * OpenAI 花标（Codex 用）。simple-icons 已把 OpenAI 系图标整体移除
 * （实测 cdn.simpleicons.org/openai 与 /codex 都是 404），这里取
 * @lobehub/icons-static-svg v1.95.0（MIT 许可）里同规格的 24×24 path。
 * hex 填 000000，深色模式靠 colorDark 覆盖成本页深色正文色。
 */
const openaiMark: ToolIcon = {
  path: "M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z",
  hex: "000000",
};

/**
 * Kaku 的 mark 是「深色圆盘 + 绿色 > + 白色 _」。本站每个格子只能填单色，
 * 所以取它的 >_ 主体自己画了一个 24×24 路径
 * （形状已用 ImageMagick 光栅化回点阵和官方 mark 比对过）。
 */
const kakuMark: ToolIcon = {
  path: "M9.6 7.2 L14.4 12 L9.6 16.8 L8.2 15.4 L11.6 12 L8.2 8.6 Z M14.4 15.4 H20 V17.2 H14.4 Z",
  hex: "4be765",
};

const tools: ToolItem[] = [
  // JetBrains 三件套按用户要求排在最前（IDEA 之后）。品牌色取自官方 logo SVG：
  // WebStorm 的 #007dfe 白底 3.91:1、深底 4.06:1 两边都过；PyCharm 官方绿 #00d886
  // 白底只有 1.88:1，浅色改用同色相压暗的 #00aa6a（3.02:1），深色才用官方绿。
  { icon: siIntellijidea, name: "IntelliJ IDEA", desc: "主力 IDE", color: "#fe2d5b" },
  { icon: siWebstorm, name: "WebStorm", desc: "前端 IDE", color: "#007dfe" },
  { icon: siPycharm, name: "PyCharm", desc: "Python IDE", color: "#00aa6a", colorDark: "#00d886" },
  // Kaku 官方绿 #4be765 白底仅 1.63:1，同样浅色压暗成 #17ab2f（3.04:1），深色用官方绿（9.77:1）
  { icon: kakuMark, name: "Kaku", desc: "AI 编码终端", color: "#17ab2f", colorDark: "#4be765" },
  { icon: siGit, name: "Git", desc: "版本管理" },
  // 这两个品牌色是纯黑，深色下换成本页深色正文色（--text 的 #e0e0e0），不另造新色
  { icon: siGithub, name: "GitHub", desc: "代码托管 · 本站仓库", colorDark: "#e0e0e0" },
  { icon: siVercel, name: "Vercel", desc: "本站部署", colorDark: "#e0e0e0" },
  { icon: siGooglechrome, name: "Chrome", desc: "调试 & 检索" },
  { icon: siObsidian, name: "Obsidian", desc: "知识库 · 本站内容源" },
  // 三个 AI 编程代理。注意 simple-icons 里 siOpenai / siChatgpt / siCodex 都不存在，
  // 所以 Codex 用的是下面手写的 OpenAI 花标；另两个有同名图标，直接用。
  // DeepSeek 的 #5786FE（浅 3.36:1 / 深 4.72:1）和 Claude Code 的 #D97757（3.12:1 / 5.09:1）
  // 都过了图标 3:1 的非文本对比标准，不需要 color 覆盖。
  { icon: siDeepseek, name: "DeepSeek Harness", desc: "AI 编程助手 · 本站开发" },
  { icon: openaiMark, name: "Codex", desc: "OpenAI 的编码代理", colorDark: "#e0e0e0" },
  { icon: siClaudecode, name: "Claude Code", desc: "Anthropic 的编码代理" },
];

const milestones = [
  { date: "2026-07-17", text: "博客立项：Vue 3 + Vite，Obsidian 笔记库直连成站" },
  { date: "2026-07-17", text: "深浅色主题切换上线" },
  { date: "2026-07-31", text: "打通 Obsidian 图片链路，笔记插图直接上站" },
  { date: "2026-08-02", text: "首页与相册页打磨完成" },
  { date: "2026-08-23", text: "确定克莱因蓝为全站主题色" },
  {
    date: "2026-09-08",
    text: "大版本升级：全文搜索、Obsidian Callout、KaTeX 公式、归档页、RSS 订阅与评论区",
  },
];

const poweredBy = [
  { name: "Vue 3", href: "https://vuejs.org/" },
  { name: "Vite", href: "https://vite.dev/" },
  { name: "Obsidian", href: "https://obsidian.md/" },
  { name: "Vercel", href: "https://vercel.com/" },
  { name: "Waline", href: "https://waline.js.org/" },
  { name: "marked", href: "https://marked.js.org/" },
  { name: "highlight.js", href: "https://highlightjs.org/" },
  { name: "Fuse.js", href: "https://fusejs.io/" },
  { name: "KaTeX", href: "https://katex.org/" },
  {
    name: "medium-zoom",
    href: "https://github.com/francoischalifour/medium-zoom",
  },
];

/* ===== 写作统计 ===== */

const writeStats = computed(() => {
  const allPosts = getAllPosts();
  const tagCount: Record<string, number> = {};
  const yearCount: Record<string, number> = {};
  let chars = 0;

  for (const p of getAllPostsWithContent()) {
    p.tags.forEach((t) => {
      tagCount[t] = (tagCount[t] || 0) + 1;
    });
    const year = p.date.slice(0, 4);
    yearCount[year] = (yearCount[year] || 0) + 1;

    const text = p.content
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/!?\[[^\]]*\]\([^)]*\)/g, " ");
    chars += (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    chars += (
      text.replace(/[\u4e00-\u9fa5]/g, " ").match(/[A-Za-z0-9]+/g) || []
    ).length;
  }

  const tags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const years = Object.entries(yearCount).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return {
    total: allPosts.length,
    tagCount: Object.keys(tagCount).length,
    chars,
    tags,
    maxTag: tags[0]?.[1] ?? 1,
    years,
    maxYear: Math.max(...years.map(([, n]) => n), 1),
  };
});

const heatmap = computed(() => {
  const counts: Record<string, number> = {};
  getAllPosts().forEach((p) => {
    counts[p.date] = (counts[p.date] || 0) + 1;
  });

  const WEEKS = 26;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - (WEEKS * 7 - 1) - start.getDay());

  const cells: { date: string; count: number; level: number }[] = [];
  const d = new Date(start);
  while (d <= today) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    const count = counts[key] || 0;
    cells.push({
      date: key,
      count,
      level: count === 0 ? 0 : count === 1 ? 1 : count <= 2 ? 2 : count <= 4 ? 3 : 4,
    });
    d.setDate(d.getDate() + 1);
  }
  return cells;
});

const heatmapCols = computed(() => Math.ceil(heatmap.value.length / 7));

/* ===== QQ 音乐听歌数据 ===== */

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

/** 时间戳 → 2026-09-14 20:24（访问者本地时区）；拿不到或不合法就返回空串 */
function formatStamp(ms: number): string {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
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

function updateTime() {
  const start = new Date(START_DATE).getTime();
  const diff = Date.now() - start;

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);

  timeText.value = `已运行 ${days} 天 ${hours} 小时 ${minutes} 分 ${seconds} 秒`;
}

let timer: ReturnType<typeof setInterval> | null = null;

const GH_USER = "Rainan249";
const GH_ENDPOINTS = [
  `https://api.github.com/users/${GH_USER}`,
  `https://gh-proxy.com/https://api.github.com/users/${GH_USER}`,
];

const ghLoading = ref(true);

async function loadGhStats() {
  for (const url of GH_ENDPOINTS) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (typeof data.followers !== "number") continue;
      ghStats.value = {
        followers: data.followers,
        repos: data.public_repos ?? null,
      };
      ghLoading.value = false;
      return;
    } catch {
      /* try next endpoint */
    }
  }
  ghLoading.value = false;
}

onMounted(() => {
  document.title = "ABOUT · Rainan's ink";
  updateTime();
  timer = setInterval(updateTime, 1000);
  loadGhStats();
  loadMusic();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <CursorTrail />
  <div class="about">
    <!-- 一张大卡片 -->
    <div class="card">
      <div class="card-head">
        <img :src="avatar" alt="Rainan" class="avatar" />
        <div class="head-info">
          <h1 class="name">Rainan</h1>
          <p class="title-line">Student · <a href="https://www.just.edu.cn/" target="_blank" class="school-link">JUST</a></p>
          <p class="major-line">Software Engineering Major</p>
        </div>
      </div>

      <div class="divider" />

      <ul class="bio-list">
        <li>INTJ · Building the future</li>
        <li>Learning AI development</li>
        <li>Researching Obsidian knowledge base</li>
        <li>Love Jay Chou · Playing guitar</li>
        <li>Aim to be a top-tier pro</li>
      </ul>

      <p class="motto">Motto: 立志成为一个糕手</p>
      <p class="spoiler" title="鼠标悬停揭晓，点击有惊喜" @click="onSpoilerClick">小声bb：我的小站是ai出来的</p>

      <div class="divider" />

      <div class="contacts">
        <a href="https://github.com/Rainan249" target="_blank" class="contact-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          <span>GitHub</span>
        </a>
        <a href="mailto:rainan249@163.com" class="contact-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>
          <span>Email</span>
        </a>
        <a href="https://blog.csdn.net/2502_90388158" target="_blank" class="contact-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14H6v-2h6v2zm4-4H6v-2h10v2zm0-4H6V7h10v2z"/></svg>
          <span>CSDN</span>
        </a>
      </div>
    </div>

    <!-- QQ 音乐听歌数据 -->
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

    <!-- 技术栈 -->
    <section class="about-section">
      <h2 class="section-title">TECH STACK</h2>
      <p class="section-sub">正在学习和使用的技术</p>
      <div class="tool-grid">
        <div v-for="t in techStack" :key="t.name" class="tool-item">
          <svg class="tool-icon" viewBox="0 0 24 24" :style="iconStyle(t)"><path :d="t.icon.path" /></svg>
          <div class="tool-text">
            <span class="tool-name">{{ t.name }}</span>
            <span class="tool-desc">{{ t.desc }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 工具 -->
    <section class="about-section">
      <h2 class="section-title">TOOLS</h2>
      <p class="section-sub">每天打开的家伙什</p>
      <div class="tool-grid">
        <div v-for="t in tools" :key="t.name" class="tool-item">
          <svg class="tool-icon" viewBox="0 0 24 24" :style="iconStyle(t)"><path :d="t.icon.path" /></svg>
          <div class="tool-text">
            <span class="tool-name">{{ t.name }}</span>
            <span class="tool-desc">{{ t.desc }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- GitHub 数据 -->
    <section class="about-section">
      <h2 class="section-title">GITHUB</h2>
      <p class="section-sub">实时数据，来自 GitHub API</p>
      <div class="gh-card">
        <div class="gh-item">
          <span class="gh-num">{{ ghLoading ? "…" : ghStats.followers ?? "—" }}</span>
          <span class="gh-label">Followers</span>
        </div>
        <div class="gh-item">
          <span class="gh-num">{{ ghLoading ? "…" : ghStats.repos ?? "—" }}</span>
          <span class="gh-label">Public Repos</span>
        </div>
        <a
          class="gh-link"
          href="https://github.com/Rainan249"
          target="_blank"
          rel="noopener noreferrer"
        >github.com/Rainan249 →</a>
      </div>
    </section>

    <!-- 写作统计 -->
    <section class="about-section">
      <h2 class="section-title">WRITING</h2>
      <p class="section-sub">从本地笔记实时统计</p>

      <div class="write-stats">
        <div class="ws-item">
          <span class="ws-num">{{ writeStats.total }}</span>
          <span class="ws-label">篇文章</span>
        </div>
        <div class="ws-item">
          <span class="ws-num">{{ writeStats.chars.toLocaleString() }}</span>
          <span class="ws-label">累计字数</span>
        </div>
        <div class="ws-item">
          <span class="ws-num">{{ writeStats.tagCount }}</span>
          <span class="ws-label">个标签</span>
        </div>
      </div>

      <div class="stat-block">
        <p class="stat-block-title">标签分布 Top 8</p>
        <div class="bar-list">
          <div v-for="[tag, n] in writeStats.tags" :key="tag" class="bar-row">
            <span class="bar-name">{{ tag }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: (n / writeStats.maxTag) * 100 + '%' }"></div>
            </div>
            <span class="bar-count">{{ n }}</span>
          </div>
        </div>
      </div>

      <div class="stat-block">
        <p class="stat-block-title">年度文章数</p>
        <div class="year-bars">
          <div v-for="[year, n] in writeStats.years" :key="year" class="year-bar">
            <span class="year-bar-count">{{ n }}</span>
            <div class="year-bar-fill" :style="{ height: (n / writeStats.maxYear) * 100 + '%' }"></div>
            <span class="year-bar-label">{{ year }}</span>
          </div>
        </div>
      </div>

      <div class="stat-block">
        <p class="stat-block-title">近半年写作活跃度</p>
        <div
          class="heatmap"
          :style="{ gridTemplateColumns: `repeat(${heatmapCols}, 12px)` }"
        >
          <span
            v-for="c in heatmap"
            :key="c.date"
            class="heat-cell"
            :class="'lvl-' + c.level"
            :title="`${c.date}：${c.count} 篇`"
          ></span>
        </div>
      </div>
    </section>

    <!-- 建站时间线 -->
    <section class="about-section">
      <h2 class="section-title">MILESTONES</h2>
      <p class="section-sub">本站大事记</p>
      <ul class="milestones">
        <li v-for="(m, i) in milestones" :key="i" class="milestone">
          <span class="ms-date">{{ m.date }}</span>
          <span class="ms-text">{{ m.text }}</span>
        </li>
      </ul>
    </section>

    <!-- Powered by -->
    <section class="about-section">
      <h2 class="section-title">POWERED BY</h2>
      <p class="section-sub">本站由这些优秀的开源项目与平台驱动</p>
      <ul class="powered-grid">
        <li v-for="p in poweredBy" :key="p.name">
          <a :href="p.href" target="_blank" rel="noopener noreferrer" class="powered-link">{{ p.name }}</a>
        </li>
      </ul>
    </section>

    <!-- 站点运行时间 -->
    <div class="runtime">{{ timeText }}</div>
  </div>
</template>

<style scoped>
.about {
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 24px;
}

.card {
  border-radius: 16px;
  border: 1px solid var(--border);
  padding: 36px 32px;
  background: var(--card-bg);
  text-align: center;
}

/* ===== 头部（头像 + 名称一行） ===== */

.card-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(0, 47, 167, 0.2);
}

.head-info {
  text-align: left;
}

.name {
  font-size: 1.9rem;
  font-weight: 700;
  margin: 0 0 2px;
  color: var(--text);
}

.title-line {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0 0 1px;
}

.major-line {
  font-size: 1.05rem;
  color: var(--text-tertiary);
  margin: 0;
}

.school-link {
  color: var(--accent);
  text-decoration: none;
}

.school-link:hover {
  text-decoration: underline;
}

/* ===== 分割线 ===== */

.divider {
  height: 1px;
  background: var(--border);
  margin: 24px 0;
}

/* ===== 简介 ===== */

.bio-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
}

.bio-list li {
  font-size: 1.15rem;
  color: var(--text-secondary);
  line-height: 1.6;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.bio-list li::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.5;
}

/* ===== Motto + 彩蛋 ===== */

.motto {
  margin: 18px 0 0;
  font-size: 1.02rem;
  color: var(--text-secondary);
}

.spoiler {
  display: block;
  width: fit-content;
  margin: 10px auto 0;
  padding: 2px 12px;
  border-radius: 6px;
  background: var(--tag-bg);
  color: transparent;
  cursor: none;
  user-select: none;
  transition: color 0.3s, background 0.3s;
  font-size: 0.88rem;
}

.spoiler:hover {
  background: transparent;
  color: var(--text-tertiary);
}

/* ===== 联系方式 ===== */

.contacts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 1.05rem;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
  border: 1px solid var(--border);
}

.contact-link:hover {
  background: rgba(var(--accent-rgb), 0.05);
  border-color: rgba(var(--accent-rgb), 0.2);
  color: var(--accent);
  text-decoration: none;
}

.contact-link svg {
  flex-shrink: 0;
  color: var(--accent);
}

/* ===== 区块通用 ===== */

.about-section {
  margin-top: 48px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 4px;
  color: var(--text);
  letter-spacing: 0.01em;
}

.section-sub {
  margin: 0 0 18px;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* ===== 工具网格 ===== */

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card-bg);
  transition: border-color 0.2s, transform 0.2s;
}

.tool-item:hover {
  border-color: rgba(var(--accent-rgb), 0.35);
  transform: translateY(-2px);
}

.tool-icon {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
}

/* 颜色走 CSS 变量，好按主题切换：GitHub（#181717）/ Vercel（#000000）这类纯黑品牌色
   在深色卡片（--card-bg: #222224）上会和背景融成一块，必须换浅色 */
.tool-icon path {
  fill: var(--icon-color);
}

:root.dark .tool-icon path {
  fill: var(--icon-color-dark);
}

.tool-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.tool-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
}

.tool-desc {
  font-size: 0.78rem;
  color: var(--text-tertiary);
}

/* ===== GitHub 数据卡 ===== */

.gh-card {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card-bg);
  padding: 20px 24px;
}

.gh-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.gh-num {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.gh-label {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.gh-link {
  margin-left: auto;
  font-size: 0.88rem;
  color: var(--text-secondary);
  text-decoration: none;
}

.gh-link:hover {
  color: var(--accent);
  text-decoration: none;
}

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

/* ===== 写作统计 ===== */

.write-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.ws-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 8px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card-bg);
}

.ws-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.ws-label {
  font-size: 0.78rem;
  color: var(--text-tertiary);
}

.stat-block {
  margin-bottom: 24px;
}

.stat-block-title {
  margin: 0 0 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

/* 横向条形 */
.bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.bar-name {
  flex-shrink: 0;
  width: 110px;
  font-size: 0.82rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

.bar-track {
  flex: 1;
  height: 10px;
  border-radius: 5px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 5px;
  background: linear-gradient(90deg, rgba(var(--accent-rgb), 0.55), var(--accent));
  transition: width 0.4s ease;
}

.bar-count {
  flex-shrink: 0;
  width: 22px;
  font-size: 0.78rem;
  color: var(--text-tertiary);
  font-variant-numeric: tabular-nums;
}

/* 纵向年份柱 */
.year-bars {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  height: 120px;
  padding: 8px 4px 0;
  border-bottom: 1px solid var(--border);
}

.year-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  min-width: 48px;
  gap: 6px;
}

.year-bar-count {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.year-bar-fill {
  width: 34px;
  min-height: 4px;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, var(--accent), rgba(var(--accent-rgb), 0.4));
  transition: height 0.4s ease;
}

.year-bar-label {
  font-size: 0.78rem;
  color: var(--text-tertiary);
}

/* 热力图 */
.heatmap {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(7, 12px);
  gap: 3px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.heat-cell {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: var(--border);
  opacity: 0.5;
}

.heat-cell.lvl-1 {
  background: rgba(var(--accent-rgb), 0.35);
  opacity: 1;
}

.heat-cell.lvl-2 {
  background: rgba(var(--accent-rgb), 0.55);
  opacity: 1;
}

.heat-cell.lvl-3 {
  background: rgba(var(--accent-rgb), 0.75);
  opacity: 1;
}

.heat-cell.lvl-4 {
  background: var(--accent);
  opacity: 1;
}

/* ===== 建站时间线 ===== */
.milestones {
  list-style: none;
  margin: 0;
  padding: 0 0 0 4px;
  border-left: 2px solid var(--border);
}

.milestone {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 6px 0 14px 22px;
}

.milestone::before {
  content: "";
  position: absolute;
  left: -5px;
  top: 13px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 3px var(--bg);
}

.ms-date {
  flex-shrink: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.ms-text {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* ===== Powered by ===== */

.powered-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
}

.powered-link {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card-bg);
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--accent);
  text-decoration: underline;
  text-decoration-color: rgba(var(--accent-rgb), 0.4);
  text-underline-offset: 0.22em;
  text-decoration-thickness: 1px;
  text-align: center;
  overflow: hidden;
  transition: color 0.2s, border-color 0.2s, background 0.2s,
    transform 0.2s, box-shadow 0.2s, text-decoration-color 0.2s;
}

.powered-link::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0;
  transition: opacity 0.25s;
}

.powered-link::after {
  content: "↗";
  font-size: 0.82em;
  opacity: 0.4;
  transition: transform 0.2s, opacity 0.2s;
}

.powered-link:hover {
  color: var(--accent);
  border-color: rgba(var(--accent-rgb), 0.4);
  background: rgba(var(--accent-rgb), 0.05);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(var(--accent-rgb), 0.12);
  text-decoration-color: var(--accent);
}

.powered-link:hover::before {
  opacity: 1;
}

.powered-link:hover::after {
  opacity: 0.9;
  transform: translate(2px, -2px);
}

/* ===== 运行时间 ===== */

.runtime {
  text-align: center;
  font-size: 0.82rem;
  color: var(--text-tertiary);
  margin: 32px 0 16px;
}

/* ===== 响应式 ===== */

@media (max-width: 500px) {
  .card {
    padding: 28px 20px;
  }
  .card-head {
    flex-direction: column;
    text-align: center;
  }
  .head-info {
    text-align: center;
  }
  .contacts {
    justify-content: center;
  }
  .gh-card {
    gap: 20px;
  }
  .gh-link {
    margin-left: 0;
  }
  .milestone {
    flex-direction: column;
    gap: 2px;
  }
}
</style>
