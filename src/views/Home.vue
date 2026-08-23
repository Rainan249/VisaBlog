<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useTheme } from "../lib/useTheme";
import { getAllPosts } from "../lib/posts";
import type { PostMeta } from "../lib/posts";
import CursorTrail from "../components/CursorTrail.vue";

const RADIUS = 147;
const EXPAND_DURATION = 400; // ms
const START_DATE = "2026-07-16T14:30:00";

const homeRef = ref<HTMLElement | null>(null);
const pageRef = ref<HTMLElement | null>(null);
const heroRef = ref<HTMLElement | null>(null);
const revealRef = ref<HTMLElement | null>(null);
const featuredRef = ref<HTMLElement | null>(null);

const { isDark } = useTheme();
const featuredPosts = computed<PostMeta[]>(() => getAllPosts().slice(0, 5));
const timeText = ref("");
const scrollProgress = ref(0); // 0 = top, 1 = bottom
const isBottomVisible = ref(false);

// 动画状态
let currentRadius = 0;
let targetRadius = 0;
let animating = false;
let animStart = 0;
let animFrom = 0;
let lastX = 0;
let lastY = 0;
let lastClientX = -1;
let lastClientY = -1;
let insideHome = false;

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

function circle(x: number, y: number, r: number) {
  return `circle(${r}px at ${x}px ${y}px)`;
}

function applyClip(x: number, y: number, r: number) {
  if (revealRef.value) {
    revealRef.value.style.clipPath = circle(x, y, r);
  }
}

function animateRadius() {
  if (!animating) return;
  const elapsed = performance.now() - animStart;
  const progress = Math.min(elapsed / EXPAND_DURATION, 1);
  currentRadius = animFrom + (targetRadius - animFrom) * easeOutExpo(progress);
  applyClip(lastX, lastY, currentRadius);

  if (progress < 1) {
    requestAnimationFrame(animateRadius);
  } else {
    animating = false;
    currentRadius = targetRadius;
  }
}

function startExpand(x: number, y: number) {
  lastX = x;
  lastY = y;
  if (!insideHome) {
    insideHome = true;
    // 从 0 展开到 RADIUS
    animFrom = 0;
    targetRadius = RADIUS;
    animStart = performance.now();
    if (!animating) {
      animating = true;
      requestAnimationFrame(animateRadius);
    }
  } else {
    // 已经在 home 内，直接跟随
    currentRadius = RADIUS;
    applyClip(x, y, RADIUS);
  }
}

function startCollapse() {
  insideHome = false;
  animFrom = currentRadius;
  targetRadius = 0;
  animStart = performance.now();
  if (!animating) {
    animating = true;
    requestAnimationFrame(animateRadius);
  }
}

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
let isSectionScrolling = false;
let sectionScrollFrame: number | null = null;

function onMouseMove(e: MouseEvent) {
  lastClientX = e.clientX;
  lastClientY = e.clientY;
  updateHeroInteraction(e.clientX, e.clientY);
}

function onScroll() {
  const page = pageRef.value;
  if (page) {
    const maxScroll = page.scrollHeight - page.clientHeight;
    scrollProgress.value = maxScroll > 0 ? page.scrollTop / maxScroll : 0;
    window.dispatchEvent(new CustomEvent("home-scroll", { detail: page.scrollTop }));

    // 当滚动超过hero区域时，移除reveal-active类，让光标轨迹显示
    if (page.scrollTop > 100) {
      document.body.classList.remove("reveal-active");
      insideHome = false;
    }
  }
  if (lastClientX < 0 || lastClientY < 0) return;
  updateHeroInteraction(lastClientX, lastClientY);
}

// IntersectionObserver for bottom section visibility
let observer: IntersectionObserver | null = null;

function scrollToSection(top: number) {
  const page = pageRef.value;
  if (!page) return;
  const scrollEl = page;

  const startTop = scrollEl.scrollTop;
  const distance = top - startTop;
  const duration = 700;
  const startTime = performance.now();

  if (sectionScrollFrame !== null) {
    cancelAnimationFrame(sectionScrollFrame);
  }

  isSectionScrolling = true;
  scrollEl.classList.add("section-scrolling");

  function step(now: number) {
    const progress = Math.min((now - startTime) / duration, 1);
    // Smooth cubic bezier easing
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    scrollEl.scrollTop = startTop + distance * eased;

    if (progress < 1) {
      sectionScrollFrame = requestAnimationFrame(step);
      return;
    }

    scrollEl.scrollTop = top;
    scrollEl.classList.remove("section-scrolling");
    isSectionScrolling = false;
    sectionScrollFrame = null;
  }

  sectionScrollFrame = requestAnimationFrame(step);
}

function onWheel(e: WheelEvent) {
  const page = pageRef.value;
  if (!page) return;

  if (isSectionScrolling) {
    e.preventDefault();
    return;
  }

  const sectionHeight = page.clientHeight;
  const scrollTop = page.scrollTop;
  const atHero = scrollTop < sectionHeight * 0.5;
  const atFeatured = scrollTop >= sectionHeight * 0.5;

  // Hero → 向下滚：跳到 featured
  if (e.deltaY > 0 && atHero) {
    e.preventDefault();
    scrollToSection(sectionHeight);
  }
  // Featured 顶部 → 向上滚：回到 hero
  else if (e.deltaY < 0 && atFeatured && scrollTop <= sectionHeight + 10) {
    e.preventDefault();
    scrollToSection(0);
  }
  // Featured 内容区 → 允许正常滚动
}

function isAtHeroTop() {
  const page = pageRef.value;
  return !page || page.scrollTop <= 100;
}

function updateHeroInteraction(clientX: number, clientY: number) {
  const home = homeRef.value;
  if (!home) return;

  const rect = home.getBoundingClientRect();

  const isInsideHero =
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom;

  if (!isInsideHero || !isAtHeroTop()) {
    if (insideHome) startCollapse();
    document.body.classList.remove("reveal-active");
    return;
  }

  const x = clientX - rect.left;
  const y = clientY - rect.top;
  lastX = x;
  lastY = y;

  // 进入 home 区域时触发展开动画
  if (!insideHome) {
    startExpand(x, y);
    document.body.classList.add("reveal-active");
  } else if (!animating) {
    applyClip(x, y, RADIUS);
  }

  // Tilt/parallax on hero — tilt toward mouse direction
  const hero = heroRef.value;
  if (hero) {
    const hrect = hero.getBoundingClientRect();
    const cx = hrect.left + hrect.width / 2;
    const cy = hrect.top + hrect.height / 2;
    const dx = (clientX - cx) / 30;
    const dy = (clientY - cy) / 30;
    hero.style.setProperty("--tilt-x", `${dy}deg`);
    hero.style.setProperty("--tilt-y", `${-dx}deg`);
    hero.style.setProperty("--shadow-x", `${-dx * 4}px`);
    hero.style.setProperty("--shadow-y", `${-dy * 4}px`);
  }

  // Glow parallax
  document.querySelectorAll(".bg-glow").forEach((el) => {
    const e2 = el as HTMLElement;
    const s = parseFloat(e2.dataset.speed || "0.02");
    e2.style.transform = `translate(${(clientX - window.innerWidth / 2) * s}px, ${(clientY - window.innerHeight / 2) * s}px)`;
  });
}

onMounted(() => {
  document.title = "HOME · Rainan's ink";
  updateTime();
  timer = setInterval(updateTime, 1000);
  const page = pageRef.value;
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  page?.addEventListener("scroll", onScroll, { passive: true });
  page?.addEventListener("wheel", onWheel, { passive: false });
  onScroll();

  // IntersectionObserver for bottom section
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isBottomVisible.value = entry.isIntersecting;
      });
    },
    { root: pageRef.value, threshold: 0.1 }
  );
  if (featuredRef.value) {
    observer.observe(featuredRef.value);
  }
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (sectionScrollFrame !== null) {
    cancelAnimationFrame(sectionScrollFrame);
  }
  document.body.classList.remove("reveal-active");
  const page = pageRef.value;
  window.removeEventListener("mousemove", onMouseMove);
  page?.removeEventListener("scroll", onScroll);
  page?.removeEventListener("wheel", onWheel);
  if (observer) {
    observer.disconnect();
  }
});
</script>

<template>
  <CursorTrail />
  <main ref="pageRef" class="home-page" :class="{ dark: isDark }">
    <!-- Scroll Progress Indicator -->
    <div class="scroll-indicator" :class="{ 'at-bottom': scrollProgress > 0.9 }">
      <div class="scroll-dot" :style="{ top: `${scrollProgress * 100}%` }"></div>
    </div>

    <section ref="homeRef" class="home home-hero">
      <div class="bg-glow bg-glow--top" data-speed="0.03" />
      <div class="bg-glow bg-glow--bottom" data-speed="0.02" />
      <div class="bg-grid" />

      <!-- 浅色背景图案 -->
      <div class="text-pattern" aria-hidden="true">
        <div v-for="row in 12" :key="row" class="pattern-row">
          <span v-for="col in 10" :key="col" class="pattern-char">R A I N A N</span>
        </div>
      </div>

      <!-- 深色圈层 (覆盖整个 home，跟随鼠标) -->
      <div ref="revealRef" class="reveal-layer" aria-hidden="true">
        <div class="reveal-pattern" aria-hidden="true">
          <div v-for="row in 12" :key="row" class="pattern-row">
            <span v-for="col in 10" :key="col" class="pattern-char pat-dark">R A I N A N</span>
          </div>
        </div>
        <div class="reveal-body">
          <h1 class="rw-title rw-dark">你好，我是 Rainan</h1>
          <p class="rw-sub rw-dark">立志成为一个糕手</p>
          <div class="rw-divider"><span class="rw-dot" /></div>
          <p class="rw-desc rw-dark">这里是我的个人博客，很高兴认识你!</p>
        </div>
      </div>

      <section ref="heroRef" class="hero">
        <h1 class="rw-title">HELLO, I'M Rainan</h1>
        <p class="rw-sub">Aim to be a top-tier pro.</p>
        <div class="rw-divider"><span class="rw-dot" /></div>
        <p class="rw-desc">This is my blog，nice to meet you!</p>
      </section>

      <div class="scroll-hint">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </section>

    <section ref="featuredRef" class="home-featured" :class="{ 'visible': isBottomVisible }">
      <div class="featured-shell">
        <article class="home-lower-block home-about-section">
          <div class="featured-heading">
            <span class="featured-line" aria-hidden="true" />
            <p class="featured-kicker">ABOUT</p>
          </div>
          <div class="home-about-text">
            <p>Software Engineering Student &amp; AI Programming Beginner</p>
            <p>Passionate about creation and building systematic knowledge.</p>
            <p>Currently learning machine learning and deep learning.</p>
            <p>This site collects my personal notes, creations and insights.</p>
            <p>No fancy decorations, merely documenting my growth.</p>
            <p>Life is code. I will debug it.</p>
            <div class="badge-button-row">
              <a href="https://codetime.dev" target="_blank" rel="noopener noreferrer">
                <img src="https://shields.jannchie.com/endpoint?style=flat-square&color=222222&url=https%3A%2F%2Fcodetime.dev%2Fv3%2Fusers%2Fshield%3Fuid%3D37245%26label_color%3D334155" alt="CodeTime Badge" />
              </a>
              <router-link to="/about" class="more-about-btn">More about me</router-link>
            </div>
          </div>
        </article>

        <article class="home-lower-block home-recent-section">
          <div class="featured-heading">
            <span class="featured-line" aria-hidden="true" />
            <p class="featured-kicker">RECENT</p>
          </div>
          <div class="featured-list">
            <a
              v-for="post in featuredPosts"
              :key="post.slug"
              class="featured-row"
              :href="`/blog/${post.slug}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="featured-date">{{ formatDate(post.date) }}</span>
              <h3 class="featured-title">{{ post.title }}</h3>
              <div v-if="post.tags.length" class="featured-tags-right">
                <span v-for="tag in post.tags.slice(0, 2)" :key="tag">{{ tag }}</span>
              </div>
            </a>
          </div>
          <div class="recent-footer">
            <router-link to="/blog" class="more-about-btn">More posts</router-link>
          </div>
        </article>

        <article class="home-lower-block home-education-section">
          <div class="featured-heading">
            <span class="featured-line" aria-hidden="true" />
            <p class="featured-kicker">EDUCATION</p>
          </div>
          <a href="https://www.just.edu.cn/" target="_blank" rel="noopener noreferrer" class="education-card">
            <div class="education-info">
              <h3 class="education-school">Jiangsu University of Science and Technology</h3>
              <p class="education-major">Software Engineering</p>
              <p class="education-date">September 2024 - Present</p>
            </div>
            <div class="education-logo-wrapper">
              <img src="../assets/校徽.png" alt="校徽" class="education-logo" />
            </div>
          </a>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ===== 容器 ===== */
.home-page {
  background: linear-gradient(175deg, #fafbfd 0%, #f2f5fa 40%, #fafbfd 100%);
  height: calc(100vh - 56px);
  overflow-y: auto;
  scroll-behavior: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable;
}

.home-page.section-scrolling {
  scroll-behavior: auto;
  scroll-snap-type: none;
  overscroll-behavior: contain;
}

.home {
  position: sticky;
  top: 0;
  height: calc(100vh - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px 100px;
  overflow: hidden;
  z-index: 1;
}

.home.reveal-active {
  cursor: none;
}

.home.reveal-active a,
.home.reveal-active button {
  cursor: pointer;
}

/* ===== 光晕 ===== */
.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  opacity: 0.4;
  will-change: transform;
}
.bg-glow--top {
  width: 560px; height: 560px;
  background: radial-gradient(circle, rgba(26,115,232,0.12) 0%, transparent 70%);
  top: -280px; right: -120px;
}
.bg-glow--bottom {
  width: 440px; height: 440px;
  background: radial-gradient(circle, rgba(26,115,232,0.08) 0%, transparent 70%);
  bottom: -220px; left: -100px;
}

/* ===== 网格 ===== */
.bg-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.35;
  background-image: linear-gradient(rgba(26,115,232,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(26,115,232,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 60%);
  -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 60%);
}

/* ===== 浅色背景图案 ===== */
.text-pattern {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  opacity: 0.06;
  user-select: none;
}
.pattern-row {
  display: flex;
  white-space: nowrap;
  animation: patternScroll 40s linear infinite;
}
.pattern-row:nth-child(even) { animation-direction: reverse; animation-duration: 50s; }
.pattern-char {
  font-size: clamp(2rem,4vw,3rem);
  font-weight: 800;
  letter-spacing: 0.3em;
  color: #1a73e8;
  padding: 0 0.5em;
  line-height: 1.8;
}
@keyframes patternScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* ===== 拖影圈层 ===== */
.trail-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  clip-path: circle(0px at 0px 0px);
  will-change: clip-path;
  background: #161618;
  opacity: 0;
  transition: opacity 0.9s ease-out;
}

/* ===== 深色圈层 (全页面) ===== */
.reveal-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  clip-path: circle(0px at 0px 0px);
  will-change: clip-path;
  backface-visibility: hidden;
  background: linear-gradient(135deg, #161618 0%, #1a1a2e 50%, #161618 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px 100px;
  transition: background 0.4s ease;
}

.reveal-pattern {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.12;
}
.pat-dark { color: rgba(255,255,255,0.3); }
.reveal-pattern .pattern-row { animation-play-state: paused; }

.reveal-body {
  position: relative;
  z-index: 1;
  max-width: 600px; /* matches .hero */
  width: 100%;
  text-align: center;
}

/* ===== Hero ===== */
.hero {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 600px;
  width: 100%;
  perspective: 800px;
  transform: rotateX(var(--tilt-x,0deg)) rotateY(var(--tilt-y,0deg));
  transition: transform 0.08s ease-out;
  will-change: transform;
  backface-visibility: hidden;
}

/* ===== 共用文字样式 ===== */
.rw-title {
  font-size: clamp(3.5rem,8vw,5.5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.2;
  white-space: nowrap;
  margin: 0 0 24px;
  color: #262628;
  text-shadow: 
    var(--shadow-x, 0px) var(--shadow-y, 0px) 0 rgba(26,115,232,0.25);
  animation: fadeUp 0.7s 0.05s cubic-bezier(0.22,0.61,0.36,1) both;
}
.rw-sub {
  font-size: clamp(1.3rem,3.5vw,1.7rem);
  font-weight: 400;
  color: #4a4a60;
  margin: 0;
  line-height: 1.5;
  letter-spacing: 0.03em;
  text-shadow: var(--shadow-x, 0px) var(--shadow-y, 0px) 0 rgba(26,115,232,0.2);
  animation: fadeUp 0.7s 0.15s cubic-bezier(0.22,0.61,0.36,1) both;
}
.rw-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 28px auto;
  animation: fadeUp 0.7s 0.22s cubic-bezier(0.22,0.61,0.36,1) both;
}
.rw-divider::before, .rw-divider::after {
  content: "";
  width: 40px; height: 1.5px;
  background: linear-gradient(90deg, transparent, #d0d5dd, transparent);
  filter: drop-shadow(var(--shadow-x, 0px) var(--shadow-y, 0px) 0 rgba(26,115,232,0.15));
}
.rw-dot {
  display: block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #1a73e8;
  margin: 0 14px;
  box-shadow: 0 0 10px rgba(26,115,232,0.35),
              var(--shadow-x, 0px) var(--shadow-y, 0px) 0 rgba(26,115,232,0.3);
}
.rw-desc {
  font-size: clamp(1.1rem,2.5vw,1.3rem);
  color: #6b7280;
  margin: 0 0 48px;
  line-height: 1.75;
  text-shadow: var(--shadow-x, 0px) var(--shadow-y, 0px) 0 rgba(26,115,232,0.15);
  animation: fadeUp 0.7s 0.3s cubic-bezier(0.22,0.61,0.36,1) both;
}

.scroll-hint {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(26, 115, 232, 0.3);
  animation: scrollDrift 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  z-index: 3;
}

@keyframes scrollDrift {
  0% {
    transform: translateX(-50%) translateY(0);
    opacity: 0.4;
  }
  70% {
    transform: translateX(-50%) translateY(10px);
    opacity: 0;
  }
  100% {
    transform: translateX(-50%) translateY(10px);
    opacity: 0;
  }
}

/* ===== 圈内深色样式 ===== */
.rw-dark {
  color: #fff !important;
  text-shadow: var(--shadow-x, 0px) var(--shadow-y, 0px) 0 rgba(255,255,255,0.2) !important;
  animation: none !important;
  opacity: 1 !important;
  transform: none !important;
}
.reveal-body .rw-divider::before,
.reveal-body .rw-divider::after {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  filter: drop-shadow(var(--shadow-x, 0px) var(--shadow-y, 0px) 0 rgba(255,255,255,0.15));
}
.reveal-body .rw-dot {
  background: #fff;
  box-shadow: 0 0 12px rgba(255,255,255,0.3),
              var(--shadow-x, 0px) var(--shadow-y, 0px) 0 rgba(255,255,255,0.3);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== Featured posts screen ===== */
.home-featured {
  position: relative;
  min-height: calc(100vh - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 24px 120px;
  overflow: hidden;
  z-index: 2;
  background: linear-gradient(175deg, #fafbfd 0%, #f2f5fa 40%, #fafbfd 100%);
}

.home-featured::before {
  content: "";
  position: absolute;
  inset: 8% 8% auto auto;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(26, 115, 232, 0.12), transparent 68%);
  filter: blur(80px);
  pointer-events: none;
}

.featured-shell {
  position: relative;
  z-index: 1;
  width: min(1040px, 100%);
  margin: 0 auto;
}

.featured-heading {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  margin: 4px 0 0;
}

.featured-line {
  width: 3px;
  height: 20px;
  border-radius: 999px;
  background: #1a73e8;
}

.featured-kicker {
  margin: 0;
  color: #1a73e8;
  font-size: 1.22rem;
  font-weight: 800;
  letter-spacing: 0;
}

.featured-shell h2 {
  margin: 0;
  color: #262628;
  font-size: clamp(1.8rem, 4.2vw, 3rem);
  line-height: 1.05;
  letter-spacing: -0.05em;
}

.home-lower-block {
  position: relative;
  padding: 24px;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
  display: grid;
  grid-template-columns: minmax(0, 600px);
  justify-content: center;
  align-items: start;
  gap: 12px;
  opacity: 0;
  transform: translateY(30px) scale(0.98);
  will-change: transform, opacity;
  transition: opacity 0.6s cubic-bezier(0.22, 0.61, 0.36, 1),
              transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.home-featured.visible .home-lower-block {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.home-featured.visible .home-about-section {
  transition-delay: 0.05s;
}

.home-featured.visible .home-recent-section {
  transition-delay: 0.15s;
}

.home-featured.visible .home-education-section {
  transition-delay: 0.25s;
}

.home-about-section,
.home-education-section,
.home-recent-section {
  margin-top: 0;
}

.home-about-text {
  width: min(600px, 100%);
  margin: 0;
  color: #666;
  font-size: 1.24rem;
  line-height: 1.9;
  text-align: left;
}

.home-about-text p {
  margin: 0 0 10px;
}

.education-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(26, 115, 232, 0.12);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 16px rgba(26, 115, 232, 0.05);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  cursor: none;
  transition: transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1),
              box-shadow 0.3s ease,
              border-color 0.3s ease;
}

.education-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(26, 115, 232, 0.15);
  border-color: rgba(26, 115, 232, 0.3);
  text-decoration: none;
}

.education-info {
  flex: 1;
  position: relative;
  z-index: 1;
}

.education-school {
  margin: 0 0 4px;
  color: #262628;
  font-size: 1.15rem;
  font-weight: 700;
}

.education-major {
  margin: 0 0 4px;
  color: #666;
  font-size: 1rem;
}

.education-date {
  margin: 0;
  color: #999;
  font-size: 0.85rem;
}

.education-logo-wrapper {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.education-logo {
  width: 140px;
  height: 140px;
  object-fit: contain;
  object-position: center;
}

.codetime-badge {
  margin-top: 16px !important;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.codetime-badge img {
  height: 22px;
  vertical-align: middle;
}

.badge-button-row {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.badge-button-row > a:first-child {
  align-self: flex-start;
}

.badge-button-row > a:first-child img {
  height: 22px;
  vertical-align: middle;
}

.more-about-btn {
  display: inline-flex;
  align-items: center;
  align-self: flex-end;
  height: 28px;
  padding: 0 16px;
  background: rgba(26, 115, 232, 0.1);
  color: #1a73e8;
  border: 1px solid rgba(26, 115, 232, 0.2);
  border-radius: 14px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.more-about-btn:hover {
  background: rgba(26, 115, 232, 0.15);
  border-color: rgba(26, 115, 232, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.15);
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  width: min(600px, 100%);
  margin: 0;
}

.featured-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(600px, 100%);
  margin: 0;
}

.recent-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.featured-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border: 1px solid rgba(26, 115, 232, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 4px 16px rgba(26, 115, 232, 0.05);
  color: inherit;
  text-decoration: none;
  backdrop-filter: blur(20px);
  will-change: transform;
  transition: transform 0.2s cubic-bezier(0.22, 0.61, 0.36, 1),
              border-color 0.2s ease,
              box-shadow 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
}

.featured-row:hover {
  transform: translateX(4px);
  border-color: rgba(26, 115, 232, 0.35);
  box-shadow: 0 6px 24px rgba(26, 115, 232, 0.12);
  text-decoration: none;
}

.featured-date {
  flex-shrink: 0;
  width: 90px;
  color: #1a73e8;
  font-size: 0.85rem;
  font-weight: 700;
}

.featured-title {
  flex: 1;
  margin: 0;
  color: #262628;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.featured-tags-right {
  flex-shrink: 0;
  display: flex;
  gap: 6px;
}

.featured-tags-right span {
  color: #999;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}

.featured-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: auto;
}

.featured-tags span {
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(26, 115, 232, 0.08);
  color: #1a73e8;
  font-size: 0.82rem;
  font-weight: 600;
}

@media (max-width: 900px) {
  .featured-grid { grid-template-columns: 1fr; margin: 0 auto; }
  .featured-list { width: 100%; margin: 0 auto; }
}

/* ===== 响应式 ===== */
.scroll-indicator {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60px;
  background: rgba(26, 115, 232, 0.15);
  border-radius: 2px;
  z-index: 100;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.home-page:hover .scroll-indicator,
.scroll-indicator.at-bottom {
  opacity: 1;
}

.scroll-dot {
  position: absolute;
  left: 0;
  width: 100%;
  height: 20px;
  background: #1a73e8;
  border-radius: 2px;
  transition: top 0.1s ease-out;
  box-shadow: 0 0 8px rgba(26, 115, 232, 0.4);
}

@media (max-width: 600px) {
  .home { padding: 60px 20px 80px; }
  .reveal-layer { padding: 60px 20px 80px; }
  .rw-title { font-size: 2.75rem; }
  .rw-sub { font-size: 1.15rem; }
  .rw-desc { font-size: 1rem; margin-bottom: 36px; }
  .rw-divider::before, .rw-divider::after { width: 24px; }
  .text-pattern { opacity: 0.035; }
  .reveal-layer { display: none; }
  .home-featured { padding: 56px 20px 88px; }
  .home-lower-block {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 22px;
    border-radius: 24px;
    transform: none;
  }
  .home-recent-section { margin-top: 24px; }
  .home-about-text { font-size: 1.12rem; }
  .featured-date { font-size: 0.9rem; }
  .featured-card h3 { font-size: 1.22rem; }
}
@media (max-width: 380px) {
  .rw-title { font-size: 2rem; }
}

/* ===== 深色模式 ===== */
.home-page.dark {
  background: #161618 !important;
}

.home-page.dark .rw-title {
  color: #e0e0e0;
  text-shadow: 
    var(--shadow-x, 0px) var(--shadow-y, 0px) 0 rgba(255,255,255,0.12);
}

.home-page.dark .rw-sub {
  color: #a0a0a0;
  text-shadow: var(--shadow-x, 0px) var(--shadow-y, 0px) 0 rgba(255,255,255,0.1);
}

.home-page.dark .rw-desc {
  color: #888888;
  text-shadow: var(--shadow-x, 0px) var(--shadow-y, 0px) 0 rgba(255,255,255,0.08);
}

.home-page.dark .pattern-char {
  color: rgba(255,255,255,0.15);
}

.home-page.dark .text-pattern {
  opacity: 0.12;
}

.home-page.dark .reveal-pattern {
  opacity: 0.15;
}

.home-page.dark .pat-dark {
  color: rgba(0,0,0,0.2);
}

.home-page.dark .bg-grid {
  opacity: 0.12;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
}

.home-page.dark .reveal-layer {
  background: linear-gradient(135deg, #fafbfd 0%, #f0f2f5 50%, #fafbfd 100%);
}

.home-page.dark .reveal-layer .rw-title,
.home-page.dark .reveal-layer .rw-sub,
.home-page.dark .reveal-layer .rw-desc {
  color: #262628 !important;
}

.home-page.dark .reveal-layer .rw-dot {
  background: #1a73e8;
  box-shadow: 0 0 10px rgba(26,115,232,0.35),
              var(--shadow-x, 0px) var(--shadow-y, 0px) 0 rgba(26,115,232,0.3);
}

.home-page.dark .reveal-layer .rw-divider::before,
.home-page.dark .reveal-layer .rw-divider::after {
  background: linear-gradient(90deg, transparent, rgba(0,0,0,0.15), transparent);
  filter: drop-shadow(var(--shadow-x, 0px) var(--shadow-y, 0px) 0 rgba(0,0,0,0.1));
}

.home-page.dark .bg-glow--top {
  background: radial-gradient(circle, rgba(100,140,255,0.12) 0%, transparent 70%);
}

.home-page.dark .bg-glow--bottom {
  background: radial-gradient(circle, rgba(100,140,255,0.08) 0%, transparent 70%);
}

.home-page.dark .home-featured {
  background: #161618;
}

.home-page.dark .home-featured::before {
  background: radial-gradient(circle, rgba(100, 140, 255, 0.14), transparent 68%);
}

.home-page.dark .featured-kicker {
  color: #4a9eff;
}

.home-page.dark .featured-line {
  background: #4a9eff;
}

.home-page.dark .featured-shell h2 {
  color: #e0e0e0;
}

.home-page.dark .featured-intro {
  color: #a0a0a0;
}

.home-page.dark .home-lower-block {
  background: transparent;
  box-shadow: none;
}

.home-page.dark .home-about-text {
  color: #a0a0a0;
}

.home-page.dark .education-card {
  background: rgba(34, 34, 36, 0.72);
  border-color: rgba(74, 158, 255, 0.16);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.home-page.dark .education-card:hover {
  border-color: rgba(74, 158, 255, 0.4);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.home-page.dark .education-school {
  color: #e0e0e0;
}

.home-page.dark .education-major {
  color: #a0a0a0;
}

.home-page.dark .education-date {
  color: #888;
}

.home-page.dark .featured-card {
  border-color: rgba(74, 158, 255, 0.16);
  background: rgba(34, 34, 36, 0.72);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.22);
}

.home-page.dark .featured-card:hover {
  border-color: rgba(74, 158, 255, 0.4);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.34);
}

.home-page.dark .featured-date {
  color: #4a9eff;
}

.home-page.dark .featured-card h3 {
  color: #e0e0e0;
}

.home-page.dark .featured-tags span {
  background: rgba(74, 158, 255, 0.1);
  color: #4a9eff;
}

.home-page.dark .featured-row {
  border-color: rgba(74, 158, 255, 0.16);
  background: rgba(34, 34, 36, 0.72);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.home-page.dark .featured-row:hover {
  border-color: rgba(74, 158, 255, 0.4);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
}

.home-page.dark .featured-title {
  color: #e0e0e0;
}

.home-page.dark .featured-tags-right span {
  background: rgba(74, 158, 255, 0.1);
  color: #4a9eff;
}
</style>
