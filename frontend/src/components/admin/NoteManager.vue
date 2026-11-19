<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { adminApi, type NoteMeta } from "../../lib/adminApi";
import { renderMarkdown } from "../../lib/markdown";

const props = defineProps<{ category: string }>();

interface FormState {
  name: string;
  title: string;
  date: string;
  tags: string;
  slug: string;
  content: string;
}

const notes = ref<NoteMeta[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const notice = ref("");
const editingPath = ref<string | null>(null);
const showPreview = ref(false);
const previewHtml = ref("");
const form = ref<FormState>(blankForm());

function blankForm(): FormState {
  return {
    name: "",
    title: "",
    date: new Date().toISOString().slice(0, 10),
    tags: "",
    slug: "",
    content: "",
  };
}

const tagsArray = computed(() =>
  form.value.tags
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
);

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const { notes: list } = await adminApi.listNotes(props.category);
    notes.value = list;
  } catch (err) {
    error.value = (err as Error).message;
  } finally {
    loading.value = false;
  }
}

function newNote() {
  editingPath.value = null;
  form.value = blankForm();
  showPreview.value = false;
  previewHtml.value = "";
  notice.value = "";
}

async function open(note: NoteMeta) {
  error.value = "";
  try {
    const detail = await adminApi.getNote(note.path);
    editingPath.value = detail.path;
    form.value = {
      name: detail.name,
      title: detail.title,
      date: detail.date,
      tags: detail.tags.join(", "),
      slug: detail.slug ?? "",
      content: detail.content,
    };
    showPreview.value = false;
  } catch (err) {
    error.value = (err as Error).message;
  }
}

async function save() {
  if (!form.value.title.trim()) {
    error.value = "标题不能为空";
    return;
  }
  saving.value = true;
  error.value = "";
  notice.value = "";
  try {
    const payload = {
      category: props.category,
      name: form.value.name || form.value.title,
      title: form.value.title,
      date: form.value.date,
      tags: tagsArray.value,
      slug: form.value.slug,
      content: form.value.content,
    };
    const result = editingPath.value
      ? await adminApi.updateNote(editingPath.value, payload)
      : await adminApi.createNote(payload);
    editingPath.value = result.path;
    notice.value = "已保存";
    await load();
  } catch (err) {
    error.value = (err as Error).message;
  } finally {
    saving.value = false;
  }
}

async function remove(note?: NoteMeta) {
  if (!note) return;
  if (!confirm(`确定删除「${note.title}」？`)) return;
  try {
    await adminApi.deleteNote(note.path);
    if (editingPath.value === note.path) newNote();
    await load();
  } catch (err) {
    error.value = (err as Error).message;
  }
}

async function togglePreview() {
  showPreview.value = !showPreview.value;
  if (showPreview.value) {
    previewHtml.value = await renderMarkdown(form.value.content);
  }
}

watch(() => props.category, () => {
  newNote();
  load();
}, { immediate: true });
</script>

<template>
  <div class="notes">
    <div class="toolbar">
      <div class="toolbar-title">
        <h2>{{ category || "根目录" }}</h2>
        <span class="count">{{ notes.length }} 篇</span>
      </div>
      <div class="actions">
        <button class="btn" @click="load">刷新</button>
        <button class="btn primary" @click="newNote">+ 新建笔记</button>
      </div>
    </div>

    <p v-if="error" class="alert error">{{ error }}</p>
    <p v-else-if="notice" class="alert ok">{{ notice }}</p>

    <div class="note-layout">
      <aside class="note-list">
        <p v-if="loading" class="hint">加载中…</p>
        <p v-else-if="notes.length === 0" class="hint">该分类下还没有笔记</p>
        <button
          v-for="note in notes"
          :key="note.path"
          class="note-item"
          :class="{ active: editingPath === note.path }"
          @click="open(note)"
        >
          <span class="note-title">{{ note.title }}</span>
          <span class="note-date">{{ note.date }}</span>
        </button>
      </aside>

      <section class="editor">
        <div class="grid">
          <label>
            <span>标题</span>
            <input v-model="form.title" type="text" placeholder="文章标题" />
          </label>
          <label>
            <span>日期</span>
            <input v-model="form.date" type="date" />
          </label>
          <label>
            <span>文件名</span>
            <input v-model="form.name" type="text" placeholder="留空则用标题" :disabled="!!editingPath" />
          </label>
          <label>
            <span>标签（逗号分隔，第一个作为分类）</span>
            <input v-model="form.tags" type="text" placeholder="学习笔记, Go" />
          </label>
          <label class="full">
            <span>固定链接 slug（可选，留空自动生成）</span>
            <input v-model="form.slug" type="text" placeholder="my-post" />
          </label>
        </div>

        <div class="editor-tabs">
          <button class="tab" :class="{ active: !showPreview }" @click="showPreview = false">编辑</button>
          <button class="tab" :class="{ active: showPreview }" @click="togglePreview">预览</button>
          <span class="path" v-if="editingPath">{{ editingPath }}</span>
        </div>

        <textarea
          v-if="!showPreview"
          v-model="form.content"
          class="content-input"
          placeholder="正文支持 Markdown / Obsidian 语法，图片用 ![alt](/uploads/...)"
        ></textarea>
        <div v-else class="preview post-content" v-html="previewHtml"></div>

        <div class="editor-footer">
          <button class="btn primary" :disabled="saving" @click="save">
            {{ saving ? "保存中…" : editingPath ? "保存修改" : "创建笔记" }}
          </button>
          <button
            v-if="editingPath"
            class="btn danger"
            @click="remove(notes.find((n) => n.path === editingPath))"
          >删除</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.notes {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
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

.btn {
  padding: 7px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-secondary);
  font-size: 0.88rem;
  transition: all 0.15s;
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

.btn.primary:hover {
  opacity: 0.9;
}

.btn.danger {
  border-color: #e5484d;
  color: #e5484d;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
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

.note-layout {
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr);
  gap: 16px;
  min-height: 0;
}

.note-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 68vh;
  overflow: auto;
  padding-right: 4px;
}

.note-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  transition: background 0.15s;
}

.note-item:hover {
  background: var(--bg-secondary);
}

.note-item.active {
  background: rgba(var(--accent-rgb), 0.1);
  border-color: rgba(var(--accent-rgb), 0.25);
}

.note-title {
  font-size: 0.9rem;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.note-date {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.grid label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.78rem;
  color: var(--text-tertiary);
}

.grid .full {
  grid-column: 1 / -1;
}

input {
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--card-bg);
  color: var(--text);
  font-size: 0.9rem;
  outline: none;
}

input:focus {
  border-color: var(--accent);
}

.editor-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
}

.tab {
  padding: 5px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 0.85rem;
}

.tab.active {
  background: rgba(var(--accent-rgb), 0.12);
  color: var(--accent);
}

.path {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content-input {
  min-height: 320px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.88rem;
  line-height: 1.6;
  resize: vertical;
  outline: none;
}

.content-input:focus {
  border-color: var(--accent);
}

.preview {
  min-height: 320px;
  padding: 12px 18px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card-bg);
  overflow: auto;
  line-height: 1.8;
  color: var(--text);
}

.preview :deep(h1),
.preview :deep(h2),
.preview :deep(h3) {
  margin: 0.9em 0 0.4em;
  line-height: 1.35;
}

.preview :deep(h1) { font-size: 1.5rem; }
.preview :deep(h2) { font-size: 1.25rem; }
.preview :deep(h3) { font-size: 1.08rem; }

.preview :deep(p) {
  margin: 0.6em 0;
}

.preview :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}

.preview :deep(code) {
  padding: 2px 5px;
  border-radius: 4px;
  background: var(--code-inline-bg);
  font-size: 0.86em;
}

.preview :deep(pre) {
  padding: 12px;
  border-radius: 8px;
  background: var(--code-bg);
  overflow: auto;
}

.preview :deep(blockquote) {
  margin: 0.8em 0;
  padding-left: 12px;
  border-left: 3px solid var(--accent);
  color: var(--text-secondary);
}

.editor-footer {
  display: flex;
  gap: 8px;
}

@media (max-width: 900px) {
  .note-layout {
    grid-template-columns: 1fr;
  }
  .note-list {
    flex-direction: row;
    flex-wrap: wrap;
    max-height: none;
  }
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
