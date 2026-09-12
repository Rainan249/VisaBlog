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
  siGit,
  siGooglechrome,
  siObsidian,
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

interface ToolItem {
  icon: SimpleIcon;
  name: string;
  desc: string;
  color?: string;
}

const techStack: ToolItem[] = [
  { icon: siSpringboot, name: "Spring Boot", desc: "Java 后端框架" },
  { icon: siVuedotjs, name: "Vue 3", desc: "前端框架" },
  { icon: siMysql, name: "MySQL", desc: "关系型数据库" },
  { icon: siPython, name: "Python", desc: "脚本 & 数据处理" },
  { icon: siVite, name: "Vite", desc: "构建工具" },
  { icon: siNodedotjs, name: "Node.js", desc: "JavaScript 运行时" },
];

const tools: ToolItem[] = [
  { icon: siIntellijidea, name: "IntelliJ IDEA", desc: "主力 IDE", color: "#fe2d5b" },
  { icon: siGit, name: "Git", desc: "版本管理" },
  { icon: siGooglechrome, name: "Chrome", desc: "调试 & 检索" },
  { icon: siObsidian, name: "Obsidian", desc: "知识库 · 本站内容源" },
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
  monthData?: {
    topSong?: QqSong[];
    topSinger?: { singerName: string; singerMid: string }[];
    topDataList?: QqMonthTop[];
    topGenre?: { genre2Count?: { name: string; sum: number }[] };
    preferHour?: { preferHour?: number };
    consDays?: { conDays?: number; topListen?: number; singerDay?: { singerName?: string } };
    monthDetailList?: { dataTime?: string; listenCount?: number }[];
  };
}

const qqData = ref<QqReport | null>(null);
const musicLoading = ref(false);

async function loadMusic() {
  musicLoading.value = true;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch("/api/qq-music");
      const type = res.headers.get("content-type") || "";
      if (res.ok && type.includes("application/json")) {
        qqData.value = (await res.json()) as QqReport;
        musicLoading.value = false;
        return;
      }
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  musicLoading.value = false;
}

const music = computed(() => {
  const m = qqData.value?.monthData;
  if (!m) return null;

  const songs = (m.topSong ?? []).slice(0, 3).map((s) => ({
    name: s.songName,
    sub: s.singerName,
    href: `https://i2.y.qq.com/a/song/${s.songMid}`,
    cover: s.cover,
  }));

  const singers = (m.topSinger ?? []).slice(0, 3).map((s) => ({
    name: s.singerName,
    href: `https://i2.y.qq.com/a/singer/${s.singerMid}`,
    avatar: s.singerMid
      ? `https://y.gtimg.cn/music/photo_new/T001R300x300M000${s.singerMid}.jpg`
      : undefined,
  }));

  const genres = (m.topGenre?.genre2Count ?? [])
    .slice()
    .sort((a, b) => b.sum - a.sum)
    .slice(0, 3)
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

  return {
    songs,
    singers,
    genres,
    bests,
    totalListens,
    hour: m.preferHour?.preferHour,
    days: m.consDays?.conDays,
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

    <!-- 技术栈 -->
    <section class="about-section">
      <h2 class="section-title">TECH STACK</h2>
      <p class="section-sub">正在学习和使用的技术</p>
      <div class="tool-grid">
        <div v-for="t in techStack" :key="t.name" class="tool-item">
          <svg class="tool-icon" viewBox="0 0 24 24"><path :d="t.icon.path" :fill="t.color || '#' + t.icon.hex" /></svg>
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
          <svg class="tool-icon" viewBox="0 0 24 24"><path :d="t.icon.path" :fill="t.color || '#' + t.icon.hex" /></svg>
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

    <!-- QQ 音乐听歌数据 -->
    <section v-if="music" class="about-section">
      <h2 class="section-title">MUSIC</h2>
      <p class="section-sub">本月 QQ 音乐听歌报告</p>

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

      <div class="music-grid">
        <div class="music-col">
          <p class="music-col-title">常听歌曲</p>
          <ul class="music-list">
            <li v-for="(s, i) in music.songs" :key="s.name">
              <img v-if="s.cover" :src="s.cover" alt="" class="music-cover" loading="lazy" />
              <span class="music-rank">{{ i + 1 }}</span>
              <a :href="s.href" target="_blank" rel="noopener noreferrer" class="music-name">{{ s.name }}</a>
              <span class="music-sub">{{ s.sub }}</span>
            </li>
          </ul>
        </div>
        <div class="music-col">
          <p class="music-col-title">常听歌手</p>
          <ul class="music-list">
            <li v-for="(s, i) in music.singers" :key="s.name">
              <img v-if="s.avatar" :src="s.avatar" alt="" class="music-avatar" loading="lazy" />
              <span class="music-rank">{{ i + 1 }}</span>
              <a :href="s.href" target="_blank" rel="noopener noreferrer" class="music-name">{{ s.name }}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="music-chips">
        <span v-if="music.totalListens" class="music-chip">
          累计听歌 · {{ music.totalListens }} 次
        </span>
        <span v-if="music.genres.length" class="music-chip">偏爱流派 · {{ music.genres.join(" / ") }}</span>
        <span v-if="music.hour !== undefined" class="music-chip">最爱时段 · {{ music.hour }} 点</span>
        <span v-if="music.days" class="music-chip">连续听歌 · {{ music.days }} 天</span>
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
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;
}

.music-col-title {
  margin: 0 0 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.music-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.music-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  min-width: 0;
}

.music-rank {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(var(--accent-rgb), 0.12);
  color: var(--accent);
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-variant-numeric: tabular-nums;
}

.music-cover {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.music-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.music-name {
  font-size: 0.92rem;
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
  font-size: 0.78rem;
  color: var(--text-tertiary);
}

.music-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.music-chip {
  font-size: 0.78rem;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

@media (max-width: 500px) {
  .music-bests {
    grid-template-columns: repeat(2, 1fr);
  }
  .music-grid {
    grid-template-columns: 1fr;
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
