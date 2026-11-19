<script setup lang="ts">
import { ref, watch } from "vue";
import { adminApi, apiOrigin, type ImageItem } from "../../lib/adminApi";

const props = defineProps<{ category: string }>();

const images = ref<ImageItem[]>([]);
const loading = ref(false);
const uploading = ref(false);
const error = ref("");
const notice = ref("");
const fileInput = ref<HTMLInputElement | null>(null);

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const { images: list } = await adminApi.listImages(props.category);
    images.value = list;
  } catch (err) {
    error.value = (err as Error).message;
  } finally {
    loading.value = false;
  }
}

function pick() {
  fileInput.value?.click();
}

async function onFiles(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);
  input.value = "";
  if (files.length === 0) return;

  uploading.value = true;
  error.value = "";
  notice.value = "";
  try {
    const { images: uploaded } = await adminApi.uploadImages(props.category, files);
    notice.value = `已上传 ${uploaded.length} 张`;
    await load();
  } catch (err) {
    error.value = (err as Error).message;
  } finally {
    uploading.value = false;
  }
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    notice.value = `${label}已复制`;
  } catch {
    error.value = "复制失败，请手动复制";
  }
}

async function remove(image: ImageItem) {
  if (!confirm(`确定删除「${image.name}」？`)) return;
  try {
    await adminApi.deleteImage(image.path);
    await load();
  } catch (err) {
    error.value = (err as Error).message;
  }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

watch(() => props.category, load, { immediate: true });
</script>

<template>
  <div class="images">
    <div class="toolbar">
      <div class="toolbar-title">
        <h2>{{ category || "根目录" }}</h2>
        <span class="count">{{ images.length }} 张</span>
      </div>
      <div class="actions">
        <button class="btn" @click="load">刷新</button>
        <button class="btn primary" :disabled="uploading" @click="pick">
          {{ uploading ? "上传中…" : "上传图片" }}
        </button>
        <input ref="fileInput" class="file" type="file" accept="image/*" multiple @change="onFiles" />
      </div>
    </div>

    <p v-if="error" class="alert error">{{ error }}</p>
    <p v-else-if="notice" class="alert ok">{{ notice }}</p>

    <p v-if="loading" class="hint">加载中…</p>
    <p v-else-if="images.length === 0" class="hint">该分类下还没有图片，点击右上角上传</p>

    <div v-else class="grid">
      <figure v-for="image in images" :key="image.path" class="card">
        <div class="thumb">
          <img :src="apiOrigin + image.url" :alt="image.name" loading="lazy" />
        </div>
        <figcaption>
          <span class="name" :title="image.name">{{ image.name }}</span>
          <span class="meta">{{ formatSize(image.size) }}</span>
        </figcaption>
        <div class="card-actions">
          <button class="mini" @click="copyText(`![${image.name}](${image.url})`, 'Markdown')">复制 Markdown</button>
          <button class="mini" @click="copyText(image.url, '链接')">复制链接</button>
          <button class="mini danger" @click="remove(image)">删除</button>
        </div>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.images {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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

.actions {
  display: flex;
  gap: 8px;
}

.file {
  display: none;
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

.btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
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

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 14px;
}

.card {
  margin: 0;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--card-bg);
}

.thumb {
  aspect-ratio: 4 / 3;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

figcaption {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px 4px;
}

.name {
  font-size: 0.82rem;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  font-size: 0.74rem;
  color: var(--text-tertiary);
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 10px 10px;
}

.mini {
  padding: 3px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 0.74rem;
}

.mini:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.mini.danger:hover {
  border-color: #e5484d;
  color: #e5484d;
}
</style>
