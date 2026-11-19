<script setup lang="ts">
import type { TreeNode } from "../../lib/adminApi";

defineOptions({ name: "CategoryTree" });

defineProps<{
  nodes: TreeNode[];
  selected: string;
}>();

const emit = defineEmits<{ select: [path: string] }>();
</script>

<template>
  <ul class="tree">
    <li v-for="node in nodes" :key="node.path">
      <button
        type="button"
        class="tree-item"
        :class="{ active: selected === node.path }"
        @click="emit('select', node.path)"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        </svg>
        <span>{{ node.name }}</span>
      </button>
      <CategoryTree
        v-if="node.children?.length"
        :nodes="node.children"
        :selected="selected"
        @select="emit('select', $event)"
      />
    </li>
  </ul>
</template>

<style scoped>
.tree {
  list-style: none;
  margin: 0;
  padding: 0 0 0 8px;
}

.tree .tree {
  padding-left: 14px;
  border-left: 1px solid var(--border);
  margin-left: 14px;
}

li {
  margin: 2px 0;
}

.tree-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-align: left;
  transition: background 0.15s, color 0.15s;
}

.tree-item:hover {
  background: rgba(var(--accent-rgb), 0.08);
  color: var(--accent);
}

.tree-item.active {
  background: rgba(var(--accent-rgb), 0.14);
  color: var(--accent);
  font-weight: 600;
}

.tree-item svg {
  flex-shrink: 0;
  opacity: 0.7;
}
</style>
