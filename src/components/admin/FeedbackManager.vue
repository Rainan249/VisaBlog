<script setup lang="ts">
import { onMounted, ref } from "vue";
import { adminApi, type FeedbackItem } from "../../lib/adminApi";

const items = ref<FeedbackItem[]>([]);
const loading = ref(true);
const error = ref("");
const notice = ref("");

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const { feedback } = await adminApi.listFeedback();
    items.value = feedback;
  } catch (err) {
    error.value = (err as Error).message;
  } finally {
    loading.value = false;
  }
}

async function remove(item: FeedbackItem) {
  if (!confirm("确定删除这条意见？")) return;
  try {
    await adminApi.deleteFeedback(item.id);
    notice.value = "已删除";
    await load();
  } catch (err) {
    error.value = (err as Error).message;
  }
}

function formatTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("zh-CN", { hour12: false });
}

onMounted(load);
</script>

<template>
  <div class="feedback-admin">
    <div class="toolbar">
      <div class="toolbar-title">
        <h2>意见反馈</h2>
        <span class="count">{{ items.length }} 条</span>
      </div>
      <button class="btn" @click="load">刷新</button>
    </div>

    <p v-if="error" class="alert error">{{ error }}</p>
    <p v-else-if="notice" class="alert ok">{{ notice }}</p>
    <p v-if="loading" class="hint">加载中…</p>
    <p v-else-if="items.length === 0" class="hint">还没有收到意见</p>

    <div v-else class="list">
      <article v-for="item in items" :key="item.id" class="card">
        <header>
          <span class="category">{{ item.category }}</span>
          <strong class="name">{{ item.name || "匿名" }}</strong>
          <time>{{ formatTime(item.createdAt) }}</time>
          <button class="delete" @click="remove(item)">删除</button>
        </header>
        <p class="content">{{ item.content }}</p>
        <p v-if="item.contact" class="contact">联系方式：{{ item.contact }}</p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.feedback-admin {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toolbar-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

h2 {
  margin: 0;
  font-size: 1.15rem;
  color: var(--text);
}

.count,
.hint {
  color: var(--text-tertiary);
  font-size: 0.85rem;
}

.btn {
  padding: 7px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-secondary);
  font-size: 0.88rem;
}

.btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.alert {
  margin: 0;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.88rem;
}

.alert.error {
  background: rgba(229, 72, 77, 0.1);
  color: #e5484d;
}

.alert.ok {
  background: rgba(46, 160, 67, 0.12);
  color: #2ea043;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 68vh;
  overflow: auto;
}

.card {
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card-bg);
}

.card header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.category {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent);
  font-size: 0.75rem;
}

.name {
  font-size: 0.9rem;
  color: var(--text);
}

time {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.delete {
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 0.78rem;
}

.delete:hover {
  color: #e5484d;
}

.content {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.7;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.contact {
  margin: 8px 0 0;
  font-size: 0.78rem;
  color: var(--text-tertiary);
}
</style>
