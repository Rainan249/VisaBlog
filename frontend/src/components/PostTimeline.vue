<script setup lang="ts">
import type { YearGroup } from "../lib/posts";

withDefaults(
  defineProps<{
    groups: YearGroup[];
    /** slug → 搜索命中摘要 */
    snippets?: Record<string, string>;
    /** 是否显示文章标签（Blog 显示，Tag 页不必重复） */
    showTags?: boolean;
    /** Tag 页用的紧凑字号 */
    compact?: boolean;
    emptyText?: string;
  }>(),
  { snippets: () => ({}), showTags: false, compact: false, emptyText: "没有找到相关文章" }
);
</script>

<template>
  <div class="timeline" :class="{ compact }">
    <template v-for="group in groups" :key="group.year">
      <h2 class="year-header">{{ group.year }}</h2>

      <template v-for="month in group.months" :key="month.key">
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
              <template v-if="showTags">
                <span v-for="tag in post.tags" :key="tag" class="item-tag">
                  <RouterLink :to="`/tags/${encodeURIComponent(tag)}`" class="item-tag-link">{{ tag }}</RouterLink>
                </span>
              </template>
            </div>
            <p v-if="snippets[post.slug]" class="item-snippet">{{ snippets[post.slug] }}</p>
          </li>
        </ul>
      </template>
    </template>

    <p v-if="groups.length === 0" class="empty">{{ emptyText }}</p>
  </div>
</template>

<style scoped>
.timeline {
  margin-top: 8px;
}

.year-header {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text);
  margin: 32px 0 4px;
  letter-spacing: -0.02em;
}

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

.item-tag {
  flex-shrink: 0;
  font-size: 0.85rem;
  color: var(--text-tertiary);
}

.item-tag-link {
  color: inherit;
  text-decoration: none;
}

.item-tag-link:hover {
  color: var(--accent);
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

.empty {
  text-align: center;
  color: var(--text-tertiary);
  padding: 40px 0;
}

/* Tag 页：更紧凑的层级 */
.compact .year-header {
  font-size: 1.6rem;
}

.compact .month-header {
  font-size: 1rem;
}
</style>
