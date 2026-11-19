<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { submitFeedback } from "../lib/adminApi";

const name = ref("");
const contact = ref("");
const category = ref("建议");
const content = ref("");
const sending = ref(false);
const error = ref("");
const done = ref(false);

const remaining = computed(() => 5000 - content.value.length);
const canSubmit = computed(
  () => content.value.trim().length > 0 && remaining.value >= 0 && !sending.value
);

onMounted(() => {
  document.title = "FEEDBACK · Rainan's ink";
});

async function submit() {
  if (!canSubmit.value) return;
  sending.value = true;
  error.value = "";
  try {
    await submitFeedback({
      name: name.value.trim(),
      contact: contact.value.trim(),
      category: category.value,
      content: content.value.trim(),
    });
    done.value = true;
    name.value = "";
    contact.value = "";
    category.value = "建议";
    content.value = "";
  } catch (err) {
    error.value = (err as Error).message;
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <div class="feedback-page">
    <header class="feedback-header">
      <h1>FEEDBACK</h1>
      <p>对站点、文章或内容有什么想法，欢迎留言。</p>
    </header>

    <div v-if="done" class="done-card">
      <h2>收到啦，谢谢！</h2>
      <p>你的意见已经记录，我会尽快查看。</p>
      <button class="btn" @click="done = false">再写一条</button>
    </div>

    <form v-else class="feedback-form" @submit.prevent="submit">
      <div class="row">
        <label>
          <span>称呼（可选）</span>
          <input v-model="name" type="text" maxlength="60" placeholder="怎么称呼你" />
        </label>
        <label>
          <span>联系方式（可选）</span>
          <input v-model="contact" type="text" maxlength="120" placeholder="邮箱 / 微信" />
        </label>
      </div>

      <label>
        <span>类型</span>
        <select v-model="category">
          <option>建议</option>
          <option>问题</option>
          <option>内容纠错</option>
          <option>其他</option>
        </select>
      </label>

      <label>
        <span>内容</span>
        <textarea v-model="content" maxlength="5000" rows="8" placeholder="写下你的意见…"></textarea>
        <small :class="{ warn: remaining < 100 }">还可以输入 {{ remaining }} 字</small>
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <button class="btn primary" type="submit" :disabled="!canSubmit">
        {{ sending ? "提交中…" : "提交意见" }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.feedback-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

.feedback-header h1 {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 700;
}

.feedback-header p {
  margin: 8px 0 32px;
  color: var(--text-secondary);
  font-size: 1.02rem;
}

.feedback-form,
.done-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--card-bg);
}

.row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--text-tertiary);
}

input,
select,
textarea {
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-size: 0.92rem;
  font-family: inherit;
  outline: none;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--accent);
}

textarea {
  resize: vertical;
  line-height: 1.7;
}

small {
  align-self: flex-end;
  color: var(--text-tertiary);
}

small.warn {
  color: #d97706;
}

.btn {
  align-self: flex-start;
  padding: 9px 20px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-secondary);
  font-size: 0.92rem;
}

.btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
  font-weight: 600;
}

.btn:disabled {
  opacity: 0.55;
}

.error {
  margin: 0;
  color: #e5484d;
  font-size: 0.85rem;
}

.done-card h2 {
  margin: 0;
  font-size: 1.3rem;
}

.done-card p {
  margin: 0;
  color: var(--text-secondary);
}

@media (max-width: 600px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
