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
  // year → month → posts[]
  const yearMap = new Map<number, Map<string, PostMeta[]>>();
  const monthNames = ["", "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  const monthEn = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  for (const post of filteredPosts.value) {
    const [y, m] = post.date.split("-");
    const year = Number(y);
    const monthKey = m;

    if (!yearMap.has(year)) yearMap.set(year, new Map());
    const monthMap = yearMap.get(year)!;
    if (!monthMap.has(monthKey)) monthMap.set(monthKey, []);
    monthMap.get(monthKey)!.push(post);
  }

  // 排序：年份降序，月份降序
  const result: { year: number; months: { key: string; label: string; posts: PostMeta[] }[] }[] = [];
  for (const [year, monthMap] of Array.from(yearMap.entries()).sort((a, b) => b[0] - a[0])) {
    const months = Array.from(monthMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, posts]) => ({
        key,
        label: `${monthNames[Number(key)]} · ${monthEn[Number(key)]}`,
        posts,
      }));
    result.push({ year, months });
  }
  return result;
});

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

    <div class="timeline">
      <template v-for="group in groupedPosts" :key="group.year">
        <!-- 年份 -->
        <h2 class="year-header">{{ group.year }}</h2>

        <template v-for="month in group.months" :key="month.key">
          <!-- 月份 -->
          <h3 class="month-header">{{ month.label }}</h3>
          <ul class="timeline-list">
            <li v-for="post in month.posts" :key="post.slug" class="timeline-item">
              <span class="item-day">{{ Number(post.date.slice(8)) }}</span>
              <a :href="`/blog/${post.slug}`" target="_blank" class="item-title">{{ post.title }}</a>
              <span v-for="tag in post.tags" :key="tag" class="item-tag">{{ tag }}</span>
            </li>
          </ul>
        </template>
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
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0;
}

.blog-header p {
  color: #666;
  margin: 0;
  font-size: 1.05rem;
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
  font-size: 0.95rem;
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

/* ===== 时间轴 ===== */

.timeline {
  margin-top: 8px;
}

/* ===== 年份 ===== */

.year-header {
  font-size: 2rem;
  font-weight: 800;
  color: #222;
  margin: 32px 0 4px;
  letter-spacing: -0.02em;
}

/* ===== 月份 ===== */

.month-header {
  position: relative;
  font-size: 1.05rem;
  font-weight: 600;
  color: #666;
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
  background: #1a73e8;
}

/* ===== 文章列表 ===== */

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
  color: #aaa;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.item-title {
  flex: 1;
  min-width: 0;
  font-size: 1.05rem;
  color: #333;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.item-title:hover {
  color: #1a73e8;
  text-decoration: underline;
}

.item-tag {
  flex-shrink: 0;
  font-size: 0.85rem;
  color: #999;
}

.empty {
  text-align: center;
  color: #999;
  padding: 40px 0;
}
</style>
