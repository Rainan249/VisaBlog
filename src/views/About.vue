<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import CursorTrail from "../components/CursorTrail.vue";
import avatar from "../assets/头像.jpg";
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
  { name: "medium-zoom", href: "https://medium-zoom.francoischalifour.com/" },
];

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

onMounted(() => {
  document.title = "ABOUT · Rainan's ink";
  updateTime();
  timer = setInterval(updateTime, 1000);

  fetch("https://api.github.com/users/Rainan249")
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data) return;
      ghStats.value = {
        followers: data.followers ?? null,
        repos: data.public_repos ?? null,
      };
    })
    .catch(() => {});
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
      <p class="spoiler" title="鼠标悬停揭晓">小声说：站里不少细节是我和 AI 一起熬夜调出来的</p>

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
          <span class="gh-num">{{ ghStats.followers ?? "—" }}</span>
          <span class="gh-label">Followers</span>
        </div>
        <div class="gh-item">
          <span class="gh-num">{{ ghStats.repos ?? "—" }}</span>
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
  display: block;
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
}

.powered-link:hover {
  color: var(--accent);
  border-color: rgba(var(--accent-rgb), 0.35);
  text-decoration: none;
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
