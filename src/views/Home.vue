<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useTheme } from "../lib/useTheme";

const RADIUS = 147;

const homeRef = ref<HTMLElement | null>(null);
const heroRef = ref<HTMLElement | null>(null);
const revealRef = ref<HTMLElement | null>(null);

const { isDark } = useTheme();

function circle(posX: number, posY: number, r: number) {
  return `circle(${r}px at ${posX}px ${posY}px)`;
}

function onMouseMove(e: MouseEvent) {
  const home = homeRef.value;
  if (!home) return;

  const rect = home.getBoundingClientRect();

  // 光标在导航栏区域时，隐藏
  if (e.clientY < rect.top) {
    if (revealRef.value) revealRef.value.style.clipPath = circle(0, 0, 0);
    return;
  }

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // 圈瞬间跟随光标
  if (revealRef.value) {
    revealRef.value.style.clipPath = circle(x, y, RADIUS);
  }

  // Tilt/parallax on hero — tilt toward mouse direction
  const hero = heroRef.value;
  if (hero) {
    const hrect = hero.getBoundingClientRect();
    const cx = hrect.left + hrect.width / 2;
    const cy = hrect.top + hrect.height / 2;
    const dx = (e.clientX - cx) / 30;
    const dy = (e.clientY - cy) / 30;
    hero.style.setProperty("--tilt-x", `${dy}deg`);
    hero.style.setProperty("--tilt-y", `${-dx}deg`);
    // 阴影偏移比文字倾斜幅度大（4x），产生影子拖曳效果
    hero.style.setProperty("--shadow-x", `${-dx * 4}px`);
    hero.style.setProperty("--shadow-y", `${-dy * 4}px`);
  }

  // Glow parallax
  document.querySelectorAll(".bg-glow").forEach((el) => {
    const e2 = el as HTMLElement;
    const s = parseFloat(e2.dataset.speed || "0.02");
    e2.style.transform = `translate(${(e.clientX - window.innerWidth / 2) * s}px, ${(e.clientY - window.innerHeight / 2) * s}px)`;
  });
}

onMounted(() => window.addEventListener("mousemove", onMouseMove, { passive: true }));
onUnmounted(() => window.removeEventListener("mousemove", onMouseMove));
</script>

<template>
  <div ref="homeRef" class="home" :class="{ dark: isDark }">
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
  </div>
</template>

<style scoped>
/* ===== 容器 ===== */
.home {
  position: relative;
  min-height: calc(100vh - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px 100px;
  overflow: hidden;
  background: linear-gradient(175deg, #fafbfd 0%, #f2f5fa 40%, #fafbfd 100%);
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
  background: #161618;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px 100px; /* matches .home */
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
  transition: transform 0.1s ease-out;
  will-change: transform;
}

/* ===== 共用文字样式 ===== */
.rw-title {
  font-size: clamp(3.25rem,7.5vw,5rem);
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
  font-size: clamp(1.2rem,3vw,1.5rem);
  font-weight: 400;
  color: #4a4a60;
  margin: 0;
  line-height: 1.5;
  letter-spacing: 0.03em;
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
}
.rw-dot {
  display: block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #1a73e8;
  margin: 0 14px;
  box-shadow: 0 0 10px rgba(26,115,232,0.35);
}
.rw-desc {
  font-size: clamp(1rem,2.2vw,1.15rem);
  color: #6b7280;
  margin: 0 0 48px;
  line-height: 1.75;
  animation: fadeUp 0.7s 0.3s cubic-bezier(0.22,0.61,0.36,1) both;
}

/* ===== 圈内深色样式 ===== */
.rw-dark {
  color: #fff !important;
  animation: none !important;
  opacity: 1 !important;
  transform: none !important;
}
.reveal-body .rw-divider::before,
.reveal-body .rw-divider::after {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
}
.reveal-body .rw-dot {
  background: #fff;
  box-shadow: 0 0 12px rgba(255,255,255,0.3);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== 响应式 ===== */
@media (max-width: 600px) {
  .home { padding: 60px 20px 80px; }
  .reveal-layer { padding: 60px 20px 80px; }
  .rw-title { font-size: 2.75rem; }
  .rw-sub { font-size: 1.15rem; }
  .rw-desc { font-size: 1rem; margin-bottom: 36px; }
  .rw-divider::before, .rw-divider::after { width: 24px; }
  .text-pattern { opacity: 0.035; }
  .reveal-layer { display: none; }
}
@media (max-width: 380px) {
  .rw-title { font-size: 2rem; }
}

/* ===== 深色模式 ===== */
.home.dark {
  background: #161618 !important;
}

.home.dark .rw-title {
  color: #e0e0e0;
  text-shadow: 
    var(--shadow-x, 0px) var(--shadow-y, 0px) 0 rgba(255,255,255,0.12);
}

.home.dark .rw-sub {
  color: #a0a0a0;
}

.home.dark .rw-desc {
  color: #888888;
}

.home.dark .pattern-char {
  color: rgba(255,255,255,0.15);
}

.home.dark .text-pattern {
  opacity: 0.12;
}

.home.dark .reveal-pattern {
  opacity: 0.15;
}

.home.dark .pat-dark {
  color: rgba(0,0,0,0.2);
}

.home.dark .bg-grid {
  opacity: 0.12;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
}

.home.dark .reveal-layer {
  background: #fafbfd;
}

.home.dark .reveal-layer .rw-title,
.home.dark .reveal-layer .rw-sub,
.home.dark .reveal-layer .rw-desc {
  color: #262628 !important;
}

.home.dark .reveal-layer .rw-dot {
  background: #1a73e8;
  box-shadow: 0 0 10px rgba(26,115,232,0.35);
}

.home.dark .reveal-layer .rw-divider::before,
.home.dark .reveal-layer .rw-divider::after {
  background: linear-gradient(90deg, transparent, rgba(0,0,0,0.15), transparent);
}

.home.dark .bg-glow--top {
  background: radial-gradient(circle, rgba(100,140,255,0.12) 0%, transparent 70%);
}

.home.dark .bg-glow--bottom {
  background: radial-gradient(circle, rgba(100,140,255,0.08) 0%, transparent 70%);
}
</style>
