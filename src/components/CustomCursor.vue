<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

// 触屏设备不显示自定义光标
if (!matchMedia("(pointer: coarse)").matches) {
  const el = document.createElement("div");
  el.style.cssText = `
    position:fixed; pointer-events:none; z-index:10000;
    width:14px; height:14px;
    border-radius:50%;
    background:var(--accent);
    box-shadow:0 0 10px rgba(var(--accent-rgb),0.5);
    transform:translate(-50%,-50%);
    transition:opacity 0.3s ease;
  `;

  let origCursor = "";

  function onMouseMove(e: MouseEvent) {
    el.style.left = e.clientX + "px";
    el.style.top = e.clientY + "px";
    el.style.opacity = "1";
  }

  onMounted(() => {
    origCursor = document.body.style.cursor;
    document.body.style.cursor = "none";
    document.body.appendChild(el);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
  });

  onUnmounted(() => {
    document.body.style.cursor = origCursor;
    el.remove();
    window.removeEventListener("mousemove", onMouseMove);
  });
}
</script>

<template></template>
