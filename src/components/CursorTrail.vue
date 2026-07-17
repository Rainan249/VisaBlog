<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

const TRAIL_LENGTH = 15;
const dots: { x: number; y: number; el: HTMLDivElement }[] = [];

for (let i = 0; i < TRAIL_LENGTH; i++) {
  const el = document.createElement("div");
  const size = Math.max(2, 7 - i * 0.5);
  const opacity = Math.max(0.04, 0.5 - i * 0.045);
  el.style.cssText = `
    position:fixed; pointer-events:none; z-index:9999;
    width:${size}px; height:${size}px;
    border-radius:50%;
    background:#1a73e8;
    opacity:${opacity};
    transform:translate(-50%,-50%);
  `;
  document.body.appendChild(el);
  dots.push({ x: 0, y: 0, el });
}

let mouseX = 0;
let mouseY = 0;
let prevTime = performance.now();

function update() {
  const now = performance.now();
  const dt = Math.min((now - prevTime) / 16.67, 3); // normalize to 60fps, cap at 3
  prevTime = now;

  dots[0].x = mouseX;
  dots[0].y = mouseY;
  dots[0].el.style.left = mouseX + "px";
  dots[0].el.style.top = mouseY + "px";

  const lerp = 0.12;
  for (let i = dots.length - 1; i > 0; i--) {
    const t = 1 - Math.pow(1 - lerp, dt);
    dots[i].x += (dots[i - 1].x - dots[i].x) * t;
    dots[i].y += (dots[i - 1].y - dots[i].y) * t;
    dots[i].el.style.left = dots[i].x + "px";
    dots[i].el.style.top = dots[i].y + "px";
  }

  requestAnimationFrame(update);
}

function onMouseMove(e: MouseEvent) {
  mouseX = e.clientX;
  mouseY = e.clientY;
}

onMounted(() => {
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  requestAnimationFrame(update);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", onMouseMove);
  dots.forEach((d) => d.el.remove());
});
</script>

<template>
  <!-- Cursor trail rendered dynamically -->
</template>
