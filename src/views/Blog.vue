<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  getAllPosts,
  getAllPostsWithContent,
  groupByYearMonth,
} from "../lib/posts";
import type { PostMeta } from "../lib/posts";
import CursorTrail from "../components/CursorTrail.vue";

onMounted(() => {
  document.title = "BLOG · Rainan's ink";
});

const allPosts = getAllPosts() as PostMeta[];
const activeTag = ref("");
const searchQuery = ref("");

const tags = computed(() => {
  const set = new Set<string>();
  allPosts.forEach((p) => p.tags.forEach((t) => set.add(t)));
  return Array.from(set).sort();
});

/* ===== 全文搜索（fuse.js 懒加载） ===== */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let fuse: any = null;
let fuseLoading = false;
const searchResults = ref<PostMeta[] | null>(null);

function stripMarkdown(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!?\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*`|~]+/g, " ")
    .replace(/\s+/g, " ");
}

async function runSearch(q: string) {
  const query = q.trim();
  if (!query) {
    searchResults.value = null;
    return;
  }

  if (!fuse && !fuseLoading) {
    fuseLoading = true;
    const { default: Fuse } = await import("fuse.js");
    fuse = new Fuse(
      getAllPostsWithContent().map((p) => ({
        ...p,
        plain: stripMarkdown(p.content),
      })),
      {
        keys: [
          { name: "title", weight: 3 },
          { name: "tags", weight: 2 },
          { name: "plain", weight: 1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
        includeMatches: true,
        minMatchCharLength: 2,
      }
    );
    fuseLoading = false;
  }
  while (fuseLoading) await new Promise((r) => setTimeout(r, 50));

  searchResults.value = fuse.search(query).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any) => r.item as PostMeta
  );
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(searchQuery, (q) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => runSearch(q), 200);
});

const snippets = computed(() => {
  const q = searchQuery.value.trim();
  const map: Record<string, string> = {};
  if (!q || !searchResults.value) return map;

  const withContent = getAllPostsWithContent();
  for (const p of searchResults.value) {
    const plain = stripMarkdown(
      withContent.find((x) => x.slug === p.slug)?.content ?? ""
    );
    const i = plain.toLowerCase().indexOf(q.toLowerCase());
    map[p.slug] =
      i >= 0
        ? (i > 30 ? "…" : "") +
          plain.slice(Math.max(0, i - 30), i + q.length + 70).trim() +
          "…"
        : plain.slice(0, 90).trim() + "…";
  }
  return map;
});

const filteredPosts = computed(() => {
  let list = searchResults.value ?? allPosts;
  if (activeTag.value) {
    list = list.filter((p) => p.tags.includes(activeTag.value));
  }
  return list;
});

const groupedPosts = computed(() => groupByYearMonth(filteredPosts.value));

const stats = computed(() => {
  const tagSet = new Set<string>();
  allPosts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  const years = groupByYearMonth(allPosts);
  return {
    total: allPosts.length,
    tagCount: tagSet.size,
    yearCount: years.length,
  };
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

    <div class="stats-bar">
      <span class="stat"><b>{{ stats.total }}</b> 篇文章</span>
      <span class="stat"><b>{{ stats.tagCount }}</b> 个标签</span>
      <span class="stat"><b>{{ stats.yearCount }}</b> 年跨度</span>
    </div>

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
            <li
              v-for="post in month.posts"
              :key="post.slug"
              class="timeline-item"
              :class="{ 'has-snippet': snippets[post.slug] }"
            >
              <div class="timeline-row">
                <span class="item-day">{{ Number(post.date.slice(8)) }}</span>
                <RouterLink :to="`/blog/${post.slug}`" target="_blank" class="item-title">{{ post.title }}</RouterLink>
                <span v-for="tag in post.tags" :key="tag" class="item-tag">
                  <RouterLink :to="`/tags/${encodeURIComponent(tag)}`" class="item-tag-link">{{ tag }}</RouterLink>
                </span>
              </div>
              <p v-if="snippets[post.slug]" class="item-snippet">{{ snippets[post.slug] }}</p>
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
  color: var(--text-secondary);
  margin: 0;
  font-size: 1.05rem;
}

/* ===== 统计条 ===== */

.stats-bar {
  display: flex;
  gap: 18px;
  margin-bottom: 24px;
  padding: 12px 18px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-secondary);
  font-size: 0.88rem;
  color: var(--text-tertiary);
}

.stats-bar b {
  color: var(--accent);
  font-weight: 700;
  margin-right: 3px;
  font-variant-numeric: tabular-nums;
}

/* ===== 标签栏 ===== */

.tag-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.tag-btn {
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.95rem;
  cursor: none;
  transition: all 0.2s;
}

.tag-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.tag-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
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
  background: var(--chip-gradient);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: none;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.search-toggle:hover {
  background: var(--chip-gradient-hover);
  color: var(--accent);
  box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.2);
  transform: scale(1.08);
}

.search-toggle:active {
  transform: scale(0.95);
}

.search-wrapper:hover .search-toggle {
  background: var(--chip-gradient-strong);
  color: var(--bg);
  box-shadow: 0 4px 14px rgba(var(--accent-rgb), 0.35);
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
  background: var(--card-bg);
  font-size: 0.875rem;
  outline: none;
  color: var(--text);
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
  border-bottom-color: var(--accent);
  box-shadow: 0 2px 12px rgba(var(--accent-rgb), 0.12);
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
  color: var(--text);
  margin: 32px 0 4px;
  letter-spacing: -0.02em;
}

/* ===== 月份 ===== */

.month-header {
  position: relative;
  font-size: 1.05rem;
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

/* ===== 文章列表 ===== */

.timeline-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.timeline-item {
  padding: 5px 0;
  line-height: 1.5;
}

.timeline-item.has-snippet {
  padding: 10px 0;
}

.timeline-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-snippet {
  margin: 4px 0 0 34px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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

.item-tag {
  flex-shrink: 0;
  font-size: 0.85rem;
  color: #999;
}

.item-tag-link {
  color: inherit;
  text-decoration: none;
}

.item-tag-link:hover {
  color: var(--accent);
  text-decoration: none;
}

.empty {
  text-align: center;
  color: var(--text-tertiary);
  padding: 40px 0;
}
</style>
