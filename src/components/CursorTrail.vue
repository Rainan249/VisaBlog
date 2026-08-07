<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

const MAX_POINTS = 30;
const points: { x: number; y: number; t: number }[] = [];
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let mouseX = -100;
let mouseY = -100;
let rafId = 0;
let lastAdd = 0;

function initCanvas() {
  canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");
}

function isRevealActive() {
  return document.body.classList.contains("reveal-active");
}

function addPoint(x: number, y: number) {
  if (isRevealActive()) {
    points.length = 0;
    return;
  }

  const now = Date.now();
  if (now - lastAdd < 8) return;
  lastAdd = now;
  points.push({ x, y, t: now });
  while (points.length > MAX_POINTS) points.shift();
}

function draw() {
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const now = Date.now();

  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const age = (now - p1.t) / 800; // 0 → 1 over 0.8 seconds
    if (age > 1) continue;

    const ease = Math.cos((age * Math.PI) / 2); // smooth 1→0
    if (ease < 0.01) continue;
    const alpha = 0.5 * ease;
    const width = 14 * ease;
    const hue = (i / points.length) * 300;

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.strokeStyle = `hsla(${hue}, 80%, 55%, ${alpha})`;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  rafId = requestAnimationFrame(draw);
}

function onMouseMove(e: MouseEvent) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  addPoint(mouseX, mouseY);
}

function onResize() {
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}

onMounted(() => {
  initCanvas();
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("resize", onResize);
  draw();
});

onUnmounted(() => {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("resize", onResize);
  cancelAnimationFrame(rafId);
  canvas?.remove();
});
</script>

<template>
  <!-- Canvas cursor trail -->
</template>
