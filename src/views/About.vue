<script setup lang="ts">
import CursorTrail from "../components/CursorTrail.vue";
</script>

<template>
  <CursorTrail />
  <div class="about">
    <h1>关于我</h1>
    <div class="content">
      <p>这里写你的个人介绍。</p>
      <p>可以介绍你的技术栈、工作经历、兴趣爱好等。</p>
      <h2>联系方式</h2>
      <ul>
        <li>GitHub：<a href="#" target="_blank">@username</a></li>
        <li>邮箱：<a href="mailto:xxx@example.com">xxx@example.com</a></li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.about {
  max-width: 680px;
  margin: 0 auto;
  padding: 48px 24px;
}

.about h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 24px;
}

.content {
  line-height: 1.8;
  color: #444;
}

.content h2 {
  font-size: 1.3rem;
  margin: 32px 0 16px;
  font-weight: 600;
}

.content p {
  margin: 0 0 16px;
}

.content ul {
  padding-left: 20px;
}

.content li {
  margin-bottom: 8px;
}

.content a {
  color: #1a73e8;
}
</style>
