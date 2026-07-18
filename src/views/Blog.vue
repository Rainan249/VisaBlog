<script setup lang="ts">
import { ref, computed } from "vue";
import { getAllPosts } from "../lib/posts";
import type { PostMeta } from "../lib/posts";
import CursorTrail from "../components/CursorTrail.vue";

const allPosts = getAllPosts() as PostMeta[];
const activeTag = ref("");

const tags = computed(() => {
  const set = new Set<string>();
  allPosts.forEach((p) => p.tags.forEach((t) => set.add(t)));
  return Array.from(set).sort();
});

const filteredPosts = computed(() => {
  if (!activeTag.value) return allPosts;
  return allPosts.filter((p) => p.tags.includes(activeTag.value));
});

function selectTag(tag: string) {
  activeTag.value = activeTag.value === tag ? "" : tag;
}
</script>

<template>
  <CursorTrail />
  <div class="blog">
    <header class="blog-header">
      <h1>BLOG</h1>
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
      <article v-for="post in filteredPosts" :key="post.slug" class="post-card">
        <a :href="`/blog/${post.slug}`" target="_blank" class="post-link">
          <h2>{{ post.title }}</h2>
          <div class="post-meta">
            <time>{{ post.date }}</time>
            <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </a>
      </article>

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

.blog-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px;
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
  font-size: 0.875rem;
  color: #888;
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
