<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import type Fuse from "fuse.js";
import { getAllPosts, getAllPostsWithContent, groupByYearMonth } from "../lib/posts";
import type { PostMeta } from "../lib/posts";
import { stripMarkdown } from "../lib/text";
import CursorTrail from "../components/CursorTrail.vue";
import PostTimeline from "../components/PostTimeline.vue";

onMounted(() => {
  document.title = "BLOG · Rainan's ink";
});

const allPosts = getAllPosts();
const activeTag = ref("");
const searchQuery = ref("");

const tags = computed(() => {
  const set = new Set<string>();
  allPosts.forEach((p) => p.tags.forEach((t) => set.add(t)));
  return Array.from(set).sort();
});

/* ===== 全文搜索（fuse.js 懒加载） ===== */

interface SearchDoc {
  slug: string;
  title: string;
  tags: string[];
  plain: string;
}

let fuse: Fuse<SearchDoc> | null = null;
let fusePromise: Promise<void> | null = null;
const searchResults = ref<PostMeta[] | null>(null);
/** slug → 正文纯文本，搜索时才加载一次（非响应式，模板用不到） */
let plainContent: Record<string, string> = {};

function ensureFuse(): Promise<void> {
  fusePromise ??= (async () => {
    const posts = await getAllPostsWithContent();
    plainContent = Object.fromEntries(
      posts.map((p) => [p.slug, stripMarkdown(p.content)])
    );
    const { default: FuseClass } = await import("fuse.js");
    fuse = new FuseClass(
      posts.map((p) => ({
        slug: p.slug,
        title: p.title,
        tags: p.tags,
        plain: plainContent[p.slug],
      })),
      {
        keys: [
          { name: "title", weight: 3 },
          { name: "tags", weight: 2 },
          { name: "plain", weight: 1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }
    );
  })();
  return fusePromise;
}

async function runSearch(q: string) {
  const query = q.trim();
  if (!query) {
    searchResults.value = null;
    return;
  }
  await ensureFuse();
  const bySlug = new Map(getAllPosts().map((p) => [p.slug, p]));
  searchResults.value = (fuse?.search(query) ?? [])
    .map((r) => bySlug.get(r.item.slug))
    .filter((p): p is PostMeta => Boolean(p));
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

  for (const p of searchResults.value) {
    const plain = plainContent[p.slug] ?? "";
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
  return {
    total: allPosts.length,
    tagCount: tagSet.size,
    yearCount: groupByYearMonth(allPosts).length,
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
          <button class="search-toggle" aria-label="搜索">
            <svg class="search-glass" viewBox="0 0 24 24" fill="none">
              <circle cx="10.5" cy="10.5" r="7" stroke="currentColor" stroke-width="2.2" />
              <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
            </svg>
          </button>
          <input
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

    <div class="tag-bar" v-if="tags.length > 0">
      <button class="tag-btn" :class="{ active: activeTag === '' }" @click="activeTag = ''">全部</button>
      <button
        v-for="tag in tags"
        :key="tag"
        class="tag-btn"
        :class="{ active: activeTag === tag }"
        @click="selectTag(tag)"
      >{{ tag }}</button>
    </div>

    <PostTimeline :groups="groupedPosts" :snippets="snippets" show-tags />
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
  color: var(--text-tertiary);
}
</style>
