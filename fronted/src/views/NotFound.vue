<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAllPosts } from "../lib/posts";

const router = useRouter();

function randomPost() {
  const all = getAllPosts();
  if (all.length === 0) return;
  const pick = all[Math.floor(Math.random() * all.length)];
  router.push(`/blog/${pick.slug}`);
}

onMounted(() => {
  document.title = "404 · Rainan's ink";
});
</script>

<template>
  <div class="not-found-page">
    <p class="code">404</p>
    <h1>页面走丢了</h1>
    <p class="desc">The page you are looking for does not exist.</p>
    <div class="actions">
      <RouterLink to="/" class="action-btn primary">返回首页</RouterLink>
      <RouterLink to="/blog" class="action-btn">浏览文章</RouterLink>
      <button class="action-btn" @click="randomPost">随机一篇</button>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}

.code {
  font-size: 6rem;
  font-weight: 800;
  margin: 0;
  line-height: 1;
  color: var(--accent);
  letter-spacing: 0.05em;
  font-variant-numeric: tabular-nums;
}

h1 {
  font-size: 1.5rem;
  margin: 20px 0 8px;
  color: var(--text);
}

.desc {
  color: var(--text-secondary);
  margin: 0 0 32px;
}

.actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 10px 24px;
  border-radius: 10px;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.action-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
  text-decoration: none;
}

.action-btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
}

.action-btn.primary:hover {
  opacity: 0.9;
  color: var(--bg);
}
</style>
