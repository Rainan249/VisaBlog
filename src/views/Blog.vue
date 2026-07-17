<script setup lang="ts">
import { getAllPosts } from "../lib/posts";
import type { PostMeta } from "../lib/posts";
import CursorTrail from "../components/CursorTrail.vue";

const posts = getAllPosts() as PostMeta[];
</script>

<template>
  <CursorTrail />
  <div class="blog">
    <header class="blog-header">
      <h1>博客</h1>
      <p>用 Markdown 写文章，用 Vue 3 搭博客</p>
    </header>

    <div class="post-list">
      <article v-for="post in posts" :key="post.slug" class="post-card">
        <a :href="`/blog/${post.slug}`" target="_blank" class="post-link">
          <h2>{{ post.title }}</h2>
          <div class="post-meta">
            <time>{{ post.date }}</time>
            <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </a>
      </article>
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
  margin-bottom: 48px;
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
</style>
