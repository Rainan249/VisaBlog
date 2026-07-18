<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import CursorTrail from "../components/CursorTrail.vue";
import avatar from "../assets/头像.jpg";

const START_DATE = "2026-07-16T14:30:00";
const timeText = ref("");

function updateTime() {
  const start = new Date(START_DATE).getTime();
  const diff = Date.now() - start;

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);

  timeText.value = `已运行 ${days} 天 ${hours} 小时 ${minutes} 分 ${seconds} 秒`;
}

let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000); // 每秒更新
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <CursorTrail />
  <div class="about">
    <!-- 一张大卡片 -->
    <div class="card">
      <!-- 头像 + 名称（一行） -->
      <div class="card-head">
        <img :src="avatar" alt="Rainan" class="avatar" />
        <div class="head-info">
          <h1 class="name">Rainan</h1>
          <p class="title-line">Student · <a href="https://www.just.edu.cn/" target="_blank" class="school-link">JUST</a></p>
          <p class="major-line">Software Engineering Major</p>
        </div>
      </div>

      <div class="divider" />

      <!-- 简介 -->
      <p class="bio">
        Student at Jiangsu University of Science and Technology. Software Engineering Major.
        Building things that matter, always learning new things.
      </p>

      <div class="divider" />

      <!-- 技能标签 -->
      <div class="skills">
        <span class="skill-tag" v-for="skill in ['Spring','Java','Vue','MySQL','JavaScript','Python','Git']" :key="skill">{{ skill }}</span>
      </div>

      <div class="divider" />

      <!-- 联系方式（一行横排） -->
      <div class="contacts">
        <a href="https://github.com/Rainan249" target="_blank" class="contact-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          <span>GitHub</span>
        </a>
        <a href="mailto:rainan249@163.com" class="contact-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>
          <span>邮箱</span>
        </a>
        <a href="https://blog.csdn.net/2502_90388158" target="_blank" class="contact-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14H6v-2h6v2zm4-4H6v-2h10v2zm0-4H6V7h10v2z"/></svg>
          <span>CSDN</span>
        </a>
      </div>
      <div class="divider" />

      <!-- 站点运行时间 -->
      <div class="runtime">{{ timeText }}</div>
    </div>
  </div>
</template>

<style scoped>
.about {
  max-width: 760px;
  margin: 0 auto;
  padding: 48px 24px;
}

.card {
  border-radius: 16px;
  border: 1px solid #eee;
  padding: 36px 32px;
  background: #fff;
}

/* ===== 头部（头像 + 名称一行） ===== */

.card-head {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(26,115,232,0.2);
}

.name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 2px;
  color: #1a1a2e;
}

.title-line {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 1px;
}

.major-line {
  font-size: 0.85rem;
  color: #999;
  margin: 0;
}

.school-link {
  color: #1a73e8;
  text-decoration: none;
}

.school-link:hover {
  text-decoration: underline;
}

/* ===== 分割线 ===== */

.divider {
  height: 1px;
  background: #eee;
  margin: 24px 0;
}

/* ===== 简介 ===== */

.bio {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.7;
  margin: 0;
}

/* ===== 技能标签 ===== */

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 0.82rem;
  background: rgba(26,115,232,0.07);
  color: #1a73e8;
  border: 1px solid rgba(26,115,232,0.15);
  font-weight: 500;
}

/* ===== 联系方式（一行） ===== */

.contacts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  color: #555;
  font-size: 0.9rem;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
  border: 1px solid #eee;
}

.contact-link:hover {
  background: rgba(26,115,232,0.05);
  border-color: rgba(26,115,232,0.2);
  color: #1a73e8;
  text-decoration: none;
}

.contact-link svg {
  flex-shrink: 0;
  color: #1a73e8;
}

/* ===== 运行时间 ===== */

.runtime {
  text-align: center;
  font-size: 0.82rem;
  color: #aaa;
}

/* ===== 响应式 ===== */

@media (max-width: 500px) {
  .card {
    padding: 28px 20px;
  }
  .card-head {
    flex-direction: column;
    text-align: center;
  }
  .head-info {
    text-align: center;
  }
  .contacts {
    justify-content: center;
  }
  .skills {
    justify-content: center;
  }
}
</style>
