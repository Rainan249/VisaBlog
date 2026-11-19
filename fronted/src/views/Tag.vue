<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getAllPosts, groupByYearMonth } from "../lib/posts";
import CursorTrail from "../components/CursorTrail.vue";
import PostTimeline from "../components/PostTimeline.vue";

const route = useRoute();

onMounted(() => {
  document.title = "TAG · Rainan's ink";
});

const tag = computed(() => decodeURIComponent(String(route.params.tag ?? "")));

const groupedPosts = computed(() =>
  groupByYearMonth(getAllPosts().filter((p) => p.tags.includes(tag.value)))
);

const total = computed(() =>
  groupedPosts.value.reduce((n, y) => n + y.posts.length, 0)
);
</script>

<template>
  <CursorTrail />
  <div class="tag-page">
    <header class="tag-header">
      <h1><span class="hash">#</span>{{ tag }}</h1>
      <p>{{ total }} 篇文章</p>
    </header>

    <PostTimeline :groups="groupedPosts" compact empty-text="该标签下暂无文章" />

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
