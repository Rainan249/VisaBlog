<script setup lang="ts">
import type { TocItem } from "../lib/toc";

defineOptions({ name: "TocTree" });

defineProps<{
  items: TocItem[];
  activeId: string;
  collapsed: Set<string>;
}>();

const emit = defineEmits<{
  toggle: [id: string];
  navigate: [id: string];
}>();
</script>

<template>
  <ul class="toc-list">
    <li
      v-for="item in items"
      :key="item.id"
      :class="['toc-group', 'toc-group--h' + item.level]"
    >
      <div class="toc-row">
        <button
          v-if="item.children.length > 0"
          class="toc-chevron"
          :class="{ collapsed: collapsed.has(item.id) }"
          :aria-label="collapsed.has(item.id) ? '展开' : '收起'"
          @click="emit('toggle', item.id)"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <span v-else class="toc-chevron toc-chevron--ghost"></span>

        <a
          :class="['toc-link', 'toc-link--h' + item.level, { active: activeId === item.id }]"
          :href="'#' + item.id"
          @click.prevent="emit('navigate', item.id)"
        >{{ item.text }}</a>
      </div>

      <div
        v-if="item.children.length > 0"
        class="toc-children"
        :class="{ collapsed: collapsed.has(item.id) }"
      >
        <div class="toc-children-inner">
          <TocTree
            :items="item.children"
            :active-id="activeId"
            :collapsed="collapsed"
            @toggle="emit('toggle', $event)"
            @navigate="emit('navigate', $event)"
          />
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-group {
  position: relative;
  margin-bottom: 8px;
}

.toc-group--h1 { padding-left: 0; }
.toc-group--h2 { padding-left: 18px; }
.toc-group--h3 { padding-left: 18px; margin-bottom: 1px; }

.toc-row {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  position: relative;
}

.toc-chevron {
  flex-shrink: 0;
  width: 14px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-tertiary);
  padding: 0;
  margin-top: 4px;
  transition: transform 0.25s ease, color 0.15s;
}

.toc-chevron:hover { color: var(--accent); }
.toc-chevron.collapsed { transform: rotate(-90deg); }
.toc-chevron--ghost { visibility: hidden; }

.toc-link {
  position: relative;
  display: block;
  width: 100%;
  padding: 4px 8px;
  border-radius: 6px;
  text-decoration: none;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.toc-link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.toc-link--h1 {
  color: var(--accent);
  line-height: 1.45;
  font-weight: 600;
  font-size: 0.9rem;
}

.toc-link--h1:hover {
  background-color: rgba(var(--accent-rgb), 0.08);
}

.toc-link--h2 {
  color: rgba(var(--accent-rgb), 0.72);
  line-height: 1.45;
  font-weight: 500;
  font-size: 0.85rem;
}

.toc-link--h2:hover {
  color: var(--accent);
  background-color: rgba(var(--accent-rgb), 0.06);
}

.toc-link--h3 {
  color: rgba(var(--accent-rgb), 0.45);
  line-height: 1.4;
  font-size: 0.78rem;
  font-weight: 400;
}

.toc-link--h3:hover {
  color: rgba(var(--accent-rgb), 0.7);
  background-color: rgba(var(--accent-rgb), 0.06);
}

.toc-link.active {
  padding-left: 20px;
}

.toc-link.active::before {
  content: "";
  position: absolute;
  left: 8px;
  top: 50%;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  transform: translateY(-50%);
}

.toc-link--h1.active {
  color: var(--accent);
  background-color: rgba(var(--accent-rgb), 0.12);
  font-weight: 600;
}

.toc-link--h2.active {
  color: var(--accent);
  background-color: rgba(var(--accent-rgb), 0.1);
  font-weight: 500;
}

.toc-link--h3.active {
  color: rgba(var(--accent-rgb), 0.72);
  background-color: rgba(var(--accent-rgb), 0.1);
  font-weight: 500;
}

.toc-children {
  display: grid;
  grid-template-rows: 1fr;
  opacity: 1;
  transition: grid-template-rows 0.3s ease, opacity 0.2s ease;
}

.toc-children.collapsed {
  grid-template-rows: 0fr;
  opacity: 0;
}

.toc-children-inner {
  overflow: hidden;
  min-height: 0;
}
</style>
