<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getAllPosts, groupByYearMonth } from "../lib/posts";
import CursorTrail from "../components/CursorTrail.vue";

const route = useRoute();

onMounted(() => {
  document.title = "TAG · Rainan's ink";
});

const tag = computed(() => decodeURIComponent(String(route.params.tag ?? "")));

const groupedPosts = computed(() => {
  const list = getAllPosts().filter((p) => p.tags.includes(tag.value));
  return groupByYearMonth(list);
});
</script>

<template>
  <CursorTrail />
  <div class="tag-page">
    <header class="tag-header">
      <h1><span class="hash">#</span>{{ tag }}</h1>
      <p>{{ groupedPosts.reduce((n, y) => n + y.posts.length, 0) }} 篇文章</p>
    </header>

    <div class="timeline">
      <template v-for="group in groupedPosts" :key="group.year">
        <h2 class="year-header">{{ group.year }}</h2>
        <template v-for="month in group.months" :key="month.key">
          <h3 class="month-header">{{ month.label }}</h3>
          <ul class="timeline-list">
            <li v-for="post in month.posts" :key="post.slug" class="timeline-item">
              <span class="item-day">{{ Number(post.date.slice(8)) }}</span>
              <RouterLink :to="`/blog/${post.slug}`" target="_blank" class="item-title">{{ post.title }}</RouterLink>
            </li>
          </ul>
        </template>
      </template>

      <p v-if="groupedPosts.length === 0" class="empty">该标签下暂无文章</p>
    </div>

    <RouterLink to="/blog" class="back-link">← 返回全部文章</RouterLink>
  </div>
</template>

<style scoped>
.tag-page {
  max-width: 680px;
  margin: 0 auto;
  padding: 48px 24px;
}

.tag-header {
  margin-bottom: 32px;
}

.tag-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--text);
}

.hash {
  color: var(--accent);
  margin-right: 6px;
}

.tag-header p {
  color: var(--text-secondary);
  margin: 0;
}

.timeline {
  margin-top: 8px;
}

.year-header {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text);
  margin: 32px 0 4px;
  letter-spacing: -0.02em;
}

.month-header {
  position: relative;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 16px 0 6px;
  padding-left: 12px;
}

.month-header::before {
  content: "";
  position: absolute;
  left: 0;
  top: 3px;
  bottom: 3px;
  width: 2.5px;
  border-radius: 2px;
  background: var(--accent);
}

.timeline-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
  line-height: 1.5;
}

.item-day {
  flex-shrink: 0;
  width: 24px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.item-title {
  flex: 1;
  min-width: 0;
  font-size: 1.05rem;
  color: var(--text);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.item-title:hover {
  color: var(--accent);
  text-decoration: underline;
}

.empty {
  text-align: center;
  color: var(--text-tertiary);
  padding: 40px 0;
}

.back-link {
  display: inline-block;
  margin-top: 40px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.back-link:hover {
  color: var(--accent);
  text-decoration: none;
}
</style>
