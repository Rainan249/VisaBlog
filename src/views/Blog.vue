<script setup lang="ts">
import { ref, computed } from "vue";
import { getAllPosts } from "../lib/posts";
import type { PostMeta } from "../lib/posts";
import CursorTrail from "../components/CursorTrail.vue";

const allPosts = getAllPosts() as PostMeta[];
const activeTag = ref("");
const searchQuery = ref("");

const tags = computed(() => {
  const set = new Set<string>();
  allPosts.forEach((p) => p.tags.forEach((t) => set.add(t)));
  return Array.from(set).sort();
});

const filteredPosts = computed(() => {
  let list = allPosts;
  if (activeTag.value) {
    list = list.filter((p) => p.tags.includes(activeTag.value));
  }
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  return list;
});

const groupedPosts = computed(() => {
  const map = new Map<string, PostMeta[]>();
  for (const post of filteredPosts.value) {
    const d = post.date;
    const key = d.slice(0, 7); // "YYYY-MM"
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(post);
  }
  return Array.from(map.entries());
});

function formatMonth(key: string) {
  const [y, m] = key.split("-");
  return `${y}年${Number(m)}月`;
}

function selectTag(tag: string) {
  activeTag.value = activeTag.value === tag ? "" : tag;
}
</script>

<template>
  <CursorTrail />
  <div class="blog">
    <header class="blog-header">
      <div class="blog-header-top">
        <h1>BLOG</h1>
        <div class="search-wrapper">
          <button class="search-toggle">
            <svg class="search-glass" viewBox="0 0 24 24" fill="none">
              <circle cx="10.5" cy="10.5" r="7" stroke="currentColor" stroke-width="2.2" />
              <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
            </svg>
          </button>
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="搜索文章..."
            class="search-input"
          />
        </div>
      </div>
      <p>Recording the bits and pieces of life</p>
    </header>

    <!-- 标签筛选 -->
    <div class="tag-bar" v-if="tags.length > 0">
      <button
        class="tag-btn"
        :class="{ active: activeTag === '' }"
        @click="activeTag = ''"
      >全部</button>
      <button
        v-for="tag in tags"
        :key="tag"
        class="tag-btn"
        :class="{ active: activeTag === tag }"
        @click="selectTag(tag)"
      >{{ tag }}</button>
    </div>

    <div class="post-list">
      <template v-for="([month, posts]) in groupedPosts" :key="month">
        <h3 class="month-header">{{ formatMonth(month) }}</h3>
        <article v-for="post in posts" :key="post.slug" class="post-card">
          <a :href="`/blog/${post.slug}`" target="_blank" class="post-link">
            <h2>{{ post.title }}</h2>
            <div class="post-meta">
              <time>{{ post.date }}</time>
              <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </a>
        </article>
      </template>

      <p v-if="filteredPosts.length === 0" class="empty">没有找到相关文章</p>
    </div>
  </div>
</template>

<style scoped>
.blog {
  max-width: 680px;
  margin: 0 auto;
  padding: 48px 24px;
}

.blog-header {
  margin-bottom: 32px;
}

.blog-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.blog-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.blog-header p {
  color: #666;
  margin: 0;
}

/* ===== 标签栏 ===== */

.tag-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.tag-btn {
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid #e0e0e0;
  background: transparent;
  color: #666;
  font-size: 0.85rem;
  cursor: none;
  transition: all 0.2s;
}

.tag-btn:hover {
  border-color: #1a73e8;
  color: #1a73e8;
}

.tag-btn.active {
  background: #1a73e8;
  border-color: #1a73e8;
  color: #fff;
}

/* ===== 搜索框 ===== */

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  padding-right: 4px;
}

.search-toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: none;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.search-toggle:hover {
  background: linear-gradient(135deg, #e8f0fe 0%, #d2e3fc 100%);
  color: #1a73e8;
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.2);
  transform: scale(1.08);
}

.search-toggle:active {
  transform: scale(0.95);
}

.search-wrapper:hover .search-toggle {
  background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
  color: #fff;
  box-shadow: 0 4px 14px rgba(26, 115, 232, 0.35);
}

.search-glass {
  width: 20px;
  height: 20px;
}

.search-input {
  height: 40px;
  width: 0;
  padding: 0;
  margin-left: 0;
  border: none;
  border-bottom: 2px solid transparent;
  background: #fff;
  font-size: 0.875rem;
  outline: none;
  color: #333;
  border-radius: 20px;
  overflow: hidden;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition:
    width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    padding 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s ease 0.15s,
    border-color 0.3s ease;
  box-shadow: none;
}

.search-wrapper:hover .search-input {
  width: 220px;
  padding: 0 16px 0 12px;
  margin-left: 8px;
  opacity: 1;
  pointer-events: auto;
  border-bottom-color: #1a73e8;
  box-shadow: 0 2px 12px rgba(26, 115, 232, 0.12);
}

.search-input::placeholder {
  color: #aaa;
}

/* ===== 月份分组 ===== */

.month-header {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 16px 0 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #1a73e8;
  letter-spacing: 0.02em;
}

/* ===== 文章列表 ===== */

.post-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.post-card {
  border-bottom: 1px solid #eee;
  padding-bottom: 24px;
}

.post-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.post-link:hover h2 {
  color: #1a73e8;
}

.post-link h2 {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 8px;
  transition: color 0.2s;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
  color: #888;
}

.post-meta time {
  font-weight: 500;
}

.tag {
  background: #f0f0f0;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #555;
}

.empty {
  text-align: center;
  color: #999;
  padding: 40px 0;
}
</style>
