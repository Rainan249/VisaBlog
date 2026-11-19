<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const active = ref(false);
const progress = ref(0);
let tickTimer: number | null = null;
let hideTimer: number | null = null;

function start() {
  if (hideTimer !== null) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  active.value = true;
  progress.value = 8;

  if (tickTimer !== null) clearInterval(tickTimer);
  tickTimer = window.setInterval(() => {
    const remain = 100 - progress.value;
    progress.value = Math.min(92, progress.value + Math.max(0.6, remain * 0.08));
  }, 150);
}

function done() {
  if (tickTimer !== null) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
  progress.value = 100;
  hideTimer = window.setTimeout(() => {
    active.value = false;
    progress.value = 0;
  }, 280);
}

router.beforeEach(() => {
  start();
  return true;
});

router.afterEach(() => {
  done();
});

onUnmounted(() => {
  if (tickTimer !== null) clearInterval(tickTimer);
  if (hideTimer !== null) clearTimeout(hideTimer);
});
</script>

<template>
  <div
    v-show="active"
    class="top-progress"
    :style="{ width: progress + '%', opacity: progress >= 100 ? 0 : 1 }"
  ></div>
</template>

<style scoped>
.top-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background: var(--accent);
  box-shadow: 0 0 8px rgba(var(--accent-rgb), 0.6);
  z-index: 2000;
  transition: width 0.2s ease, opacity 0.28s ease;
  pointer-events: none;
}
</style>
