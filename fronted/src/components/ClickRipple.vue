<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

function onClick(e: MouseEvent) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const el = document.createElement("span");
  el.className = "click-ripple";
  el.style.left = `${e.clientX}px`;
  el.style.top = `${e.clientY}px`;
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}

onMounted(() => {
  window.addEventListener("click", onClick);
});

onUnmounted(() => {
  window.removeEventListener("click", onClick);
});
</script>

<template></template>
