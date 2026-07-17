<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

const el = document.createElement("div");
el.style.cssText = `
  position:fixed; pointer-events:none; z-index:10000;
  width:14px; height:14px;
  border-radius:50%;
  background:#1a73e8;
  box-shadow:0 0 10px rgba(26,115,232,0.5);
  transform:translate(-50%,-50%);
`;

let origCursor = "";

function onMouseMove(e: MouseEvent) {
  el.style.left = e.clientX + "px";
  el.style.top = e.clientY + "px";
}

onMounted(() => {
  origCursor = document.body.style.cursor;
  document.body.style.cursor = "none";
  document.body.appendChild(el);
  window.addEventListener("mousemove", onMouseMove, { passive: true });
});

onUnmounted(() => {
  document.body.style.cursor = origCursor;
  document.body.removeChild(el);
  window.removeEventListener("mousemove", onMouseMove);
});
</script>

<template>
  <!-- Custom cursor dot rendered in body -->
</template>
