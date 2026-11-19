<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

// 触屏设备不画拖尾
if (!matchMedia("(pointer: coarse)").matches) {
  const MAX_POINTS = 30;
  const points: { x: number; y: number; t: number }[] = [];
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
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

  function addPoint(x: number, y: number) {
    // hero 的深色圈层展开时不要拖尾
    if (document.body.classList.contains("reveal-active")) {
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
      const age = (now - p1.t) / 800;
      if (age > 1) continue;

      const ease = Math.cos((age * Math.PI) / 2);
      if (ease < 0.01) continue;

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = `hsla(${(i / points.length) * 300}, 80%, 55%, ${0.5 * ease})`;
      ctx.lineWidth = 14 * ease;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    rafId = requestAnimationFrame(draw);
  }

  function onMouseMove(e: MouseEvent) {
    addPoint(e.clientX, e.clientY);
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
}
</script>

<template></template>
