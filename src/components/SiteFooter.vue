<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const START_DATE = "2026-01-01";

const timeText = ref("");

function updateTime() {
  const start = new Date(START_DATE).getTime();
  const now = Date.now();
  const diff = now - start;

  const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  const days = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  timeText.value = `已运行 ${years} 年 ${days} 天 ${hours} 小时`;
}

let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 60000); // 每分钟更新
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <span class="runtime">{{ timeText }}</span>
      <span class="copyright">© 2026 Rainan</span>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--border);
  padding: 0 24px;
}

.footer-inner {
  max-width: 760px;
  margin: 0 auto;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
  color: var(--text-tertiary);
}

.runtime {
  color: var(--text-secondary);
}

.copyright {
  color: var(--text-tertiary);
}
</style>
