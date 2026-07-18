<script setup lang="ts">
import { useRoute } from "vue-router";
import { Sunny, Moon } from "@element-plus/icons-vue";
import { useTheme } from "../lib/useTheme";

const route = useRoute();
const { isDark, toggle } = useTheme();
const links = [
  { path: "/", label: "HOME" },
  { path: "/blog", label: "BLOG" },
  { path: "/about", label: "ABOUT" },
];

function toggleTheme() {
  toggle();
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-inner">
      <router-link to="/" class="nav-logo">Rainan's Blog</router-link>
      <div class="nav-right">
        <div class="nav-links">
          <router-link
            v-for="link in links"
            :key="link.path"
            :to="link.path"
            :class="{
              active: link.path === '/'
                ? route.path === '/'
                : route.path.startsWith(link.path),
            }"
          >
            {{ link.label }}
          </router-link>
        </div>

        <!-- 主题切换滑块 -->
        <div class="theme-toggle" @click="toggleTheme" :class="{ dark: isDark }">
          <div class="toggle-track">
            <div class="toggle-knob">
              <Sunny v-if="!isDark" :width="15" :height="15" />
              <Moon v-else :width="15" :height="15" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  border-bottom: 1px solid #eee;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-inner {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  font-size: 1.15rem;
  font-weight: 700;
  color: #333;
  text-decoration: none;
}

.nav-logo:hover {
  color: #1a73e8;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-links a {
  color: #666;
  text-decoration: none;
  font-size: 0.95rem;
  padding: 4px 0;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.active {
  color: #1a73e8;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* ---------- Theme toggle slider ---------- */

.theme-toggle {
  display: flex;
  align-items: center;
  cursor: none;
  user-select: none;
}

.toggle-track {
  position: relative;
  width: 56px;
  height: 30px;
  border-radius: 15px;
  background: #fff;
  border: 1px solid #e0e0e0;
  transition: none;
}

.theme-toggle.dark .toggle-track {
  background: #2c2c2c;
  border-color: #444;
}

.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle.dark .toggle-knob {
  transform: translateX(26px);
}
</style>
