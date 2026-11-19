<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { adminApi, type TreeNode } from "../lib/adminApi";
import CategoryTree from "../components/admin/CategoryTree.vue";
import NoteManager from "../components/admin/NoteManager.vue";
import ImageManager from "../components/admin/ImageManager.vue";
import FeedbackManager from "../components/admin/FeedbackManager.vue";

type Status = "checking" | "out" | "in";

const status = ref<Status>("checking");
const user = ref("");
const authDisabled = ref(false);
const loginName = ref("");
const loginPassword = ref("");
const loginError = ref("");
const loggingIn = ref(false);

const tab = ref<"notes" | "images" | "feedback">("notes");
const treeNotes = ref<TreeNode[]>([]);
const treeImages = ref<TreeNode[]>([]);
const selectedNotes = ref("");
const selectedImages = ref("");
const treeError = ref("");

const tree = computed(() => (tab.value === "notes" ? treeNotes.value : treeImages.value));
const selected = computed(() =>
  tab.value === "notes" ? selectedNotes.value : selectedImages.value
);

async function checkAuth() {
  try {
    const me = await adminApi.me();
    user.value = me.username;
    authDisabled.value = Boolean(me.auth_disabled);
    status.value = "in";
    await loadTrees();
  } catch {
    status.value = "out";
  }
}

async function login() {
  loggingIn.value = true;
  loginError.value = "";
  try {
    const me = await adminApi.login(loginName.value, loginPassword.value);
    user.value = me.username;
    authDisabled.value = Boolean(me.auth_disabled);
    loginPassword.value = "";
    status.value = "in";
    await loadTrees();
  } catch (err) {
    loginError.value = (err as Error).message;
    if ((err as { status?: number }).status === 401) {
      loginError.value += "（如果刚改过 backend/.env，请重启后端）";
    }
  } finally {
    loggingIn.value = false;
  }
}

async function logout() {
  await adminApi.logout().catch(() => undefined);
  status.value = "out";
  user.value = "";
  treeNotes.value = [];
  treeImages.value = [];
}

async function loadTrees() {
  treeError.value = "";
  try {
    const [notes, images] = await Promise.all([
      adminApi.tree("notes"),
      adminApi.tree("images"),
    ]);
    treeNotes.value = notes.tree;
    treeImages.value = images.tree;
  } catch (err) {
    treeError.value = (err as Error).message;
  }
}

function select(path: string) {
  if (tab.value === "notes") selectedNotes.value = path;
  else selectedImages.value = path;
}

function switchTab(next: "notes" | "images" | "feedback") {
  tab.value = next;
}

async function createCategory() {
  const name = prompt(`在「${selected.value || "根目录"}」下新建分类名称：`)?.trim();
  if (!name) return;
  try {
    await adminApi.createCategory(tab.value, selected.value, name);
    await loadTrees();
    select(selected.value ? `${selected.value}/${name}` : name);
  } catch (err) {
    treeError.value = (err as Error).message;
  }
}

async function renameCategory() {
  if (!selected.value) return;
  const current = selected.value.split("/").pop() ?? "";
  const name = prompt("新的分类名称：", current)?.trim();
  if (!name || name === current) return;
  try {
    await adminApi.renameCategory(tab.value, selected.value, name);
    const parent = selected.value.split("/").slice(0, -1).join("/");
    await loadTrees();
    select(parent ? `${parent}/${name}` : name);
  } catch (err) {
    treeError.value = (err as Error).message;
  }
}

async function deleteCategory() {
  if (!selected.value) return;
  if (!confirm(`确定删除分类「${selected.value}」？分类必须为空。`)) return;
  try {
    await adminApi.deleteCategory(tab.value, selected.value);
    await loadTrees();
    select("");
  } catch (err) {
    treeError.value = (err as Error).message;
  }
}

let robotsMeta: HTMLMetaElement | null = null;

onMounted(() => {
  document.title = "ADMIN · Rainan's ink";
  // 后台不应被搜索引擎收录
  robotsMeta = document.createElement("meta");
  robotsMeta.name = "robots";
  robotsMeta.content = "noindex, nofollow";
  document.head.appendChild(robotsMeta);
  checkAuth();
});

onUnmounted(() => {
  robotsMeta?.remove();
});
</script>

<template>
  <div class="admin-page">
    <p v-if="status === 'checking'" class="checking">正在验证登录状态…</p>

    <form v-else-if="status === 'out'" class="login-card" @submit.prevent="login">
      <h1>ADMIN</h1>
      <p class="sub">VisaBlog 内容管理</p>
      <label>
        <span>用户名</span>
        <input v-model="loginName" type="text" autocomplete="username" required />
      </label>
      <label>
        <span>密码</span>
        <input v-model="loginPassword" type="password" autocomplete="current-password" required />
      </label>
      <p v-if="loginError" class="error">{{ loginError }}</p>
      <button class="submit" type="submit" :disabled="loggingIn">
        {{ loggingIn ? "登录中…" : "登录" }}
      </button>
    </form>

    <template v-else>
      <header class="admin-header">
        <div class="brand">
          <span class="dot"></span>
          <strong>VisaBlog Admin</strong>
          <span class="user">{{ user }}</span>
          <span v-if="authDisabled" class="mode">测试模式 · 免登录</span>
        </div>
        <div class="header-actions">
          <a href="/" target="_blank" rel="noopener">查看站点</a>
          <button v-if="!authDisabled" class="ghost" @click="logout">退出登录</button>
        </div>
      </header>

      <div class="tabs">
        <button :class="{ active: tab === 'notes' }" @click="switchTab('notes')">笔记</button>
        <button :class="{ active: tab === 'images' }" @click="switchTab('images')">图片</button>
        <button :class="{ active: tab === 'feedback' }" @click="switchTab('feedback')">意见</button>
      </div>

      <div class="workspace" :class="{ single: tab === 'feedback' }">
        <aside v-if="tab !== 'feedback'" class="sidebar">
          <button class="root-item" :class="{ active: selected === '' }" @click="select('')">
            根目录
          </button>

          <div class="tree-scroll">
            <p v-if="tree.length === 0" class="empty">还没有分类</p>
            <CategoryTree :nodes="tree" :selected="selected" @select="select" />
          </div>

          <div class="cat-actions">
            <button class="mini" @click="createCategory">+ 子分类</button>
            <button class="mini" :disabled="!selected" @click="renameCategory">重命名</button>
            <button class="mini danger" :disabled="!selected" @click="deleteCategory">删除</button>
          </div>
          <p v-if="treeError" class="error small">{{ treeError }}</p>
        </aside>

        <main class="content">
          <NoteManager v-if="tab === 'notes'" :category="selectedNotes" />
          <ImageManager v-else-if="tab === 'images'" :category="selectedImages" />
          <FeedbackManager v-else />
        </main>
      </div>
    </template>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
}

/* 后台是编辑界面，恢复系统光标（站点全局是自定义光标） */
.admin-page,
.admin-page :deep(*) {
  cursor: auto !important;
}

.checking {
  padding: 80px;
  text-align: center;
  color: var(--text-tertiary);
}

.login-card {
  width: min(380px, calc(100% - 32px));
  margin: 12vh auto 0;
  padding: 32px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--card-bg);
  box-shadow: 0 20px 60px rgba(var(--accent-rgb), 0.08);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.login-card h1 {
  margin: 0;
  font-size: 1.6rem;
  letter-spacing: 0.08em;
}

.login-card .sub {
  margin: -8px 0 6px;
  color: var(--text-tertiary);
  font-size: 0.9rem;
}

.login-card label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.login-card input {
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  outline: none;
}

.login-card input:focus {
  border-color: var(--accent);
}

.submit {
  height: 40px;
  margin-top: 4px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: var(--bg);
  font-size: 0.95rem;
  font-weight: 600;
}

.submit:disabled {
  opacity: 0.6;
}

.error {
  margin: 0;
  color: #e5484d;
  font-size: 0.85rem;
}

.error.small {
  font-size: 0.76rem;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  border-bottom: 1px solid var(--border);
  background: var(--card-bg);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent);
}

.user {
  color: var(--text-tertiary);
  font-size: 0.8rem;
}

.mode {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(217, 119, 6, 0.14);
  color: #d97706;
  font-size: 0.72rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.85rem;
}

.header-actions a {
  color: var(--text-secondary);
}

.ghost {
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.workspace {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 20px;
  max-width: 1320px;
  margin: 0 auto;
  padding: 20px 24px 40px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.tabs {
  display: flex;
  gap: 8px;
  max-width: 1320px;
  margin: 16px auto 0;
  padding: 0 24px;
}

.tabs button {
  min-width: 88px;
  padding: 8px 18px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-tertiary);
  font-size: 0.85rem;
}

.tabs button.active {
  background: rgba(var(--accent-rgb), 0.12);
  border-color: rgba(var(--accent-rgb), 0.3);
  color: var(--accent);
  font-weight: 600;
}

.root-item {
  padding: 7px 10px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-align: left;
}

.root-item.active,
.root-item:hover {
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent);
}

.tree-scroll {
  max-height: 58vh;
  overflow: auto;
  padding-right: 4px;
}

.empty {
  margin: 8px 0;
  color: var(--text-tertiary);
  font-size: 0.8rem;
}

.cat-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mini {
  padding: 5px 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.78rem;
}

.mini:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.mini:disabled {
  opacity: 0.45;
}

.mini.danger:hover:not(:disabled) {
  border-color: #e5484d;
  color: #e5484d;
}

.content {
  min-width: 0;
}

.workspace.single {
  grid-template-columns: 1fr;
}

@media (max-width: 900px) {
  .workspace {
    grid-template-columns: 1fr;
    padding: 16px;
  }
  .tree-scroll {
    max-height: 30vh;
  }
}
</style>
