<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { Sunny, Moon } from "@element-plus/icons-vue";
import { useTheme } from "../lib/useTheme";

const route = useRoute();
const { isDark, toggle } = useTheme();
const isCapsule = ref(false);
const capsuleRoutes = new Set(["home", "blog", "about"]);
const links = [
  { path: "/", label: "HOME" },
  { path: "/blog", label: "BLOG" },
  { path: "/about", label: "ABOUT" },
];

function toggleTheme() {
  toggle();
}

function updateCapsule(scrollTop: number) {
  isCapsule.value = capsuleRoutes.has(String(route.name)) && scrollTop > 40;
}

function updateHomeCapsule(event: Event) {
  if (route.name !== "home") return;
  const scrollTop = event instanceof CustomEvent ? Number(event.detail) : 0;
  updateCapsule(scrollTop);
}

function updateWindowCapsule() {
  if (route.name === "home") return;
  updateCapsule(window.scrollY);
}

watch(
  () => route.name,
  (name) => {
    if (!capsuleRoutes.has(String(name))) {
      isCapsule.value = false;
      return;
    }

    updateCapsule(name === "home" ? 0 : window.scrollY);
  }
);

onMounted(() => {
  window.addEventListener("home-scroll", updateHomeCapsule);
  window.addEventListener("scroll", updateWindowCapsule, { passive: true });
  updateWindowCapsule();
});

onUnmounted(() => {
  window.removeEventListener("home-scroll", updateHomeCapsule);
  window.removeEventListener("scroll", updateWindowCapsule);
});
</script>

<template>
  <nav class="navbar" :class="{ capsule: isCapsule }">
    <div class="nav-inner">
      <router-link :to="{ name: 'home' }" class="nav-logo">Rainan's Blog</router-link>
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
  transition: background 0.3s ease, border-color 0.3s ease;
}

.navbar.capsule {
  height: 56px;
  background: transparent;
  border-color: transparent;
}

.nav-inner {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: max-width 0.3s ease, width 0.3s ease, margin 0.3s ease, padding 0.3s ease, height 0.3s ease, border-radius 0.3s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.navbar.capsule .nav-inner {
  width: min(600px, calc(100% - 32px));
  max-width: 600px;
  height: 44px;
  margin: 6px auto 0;
  padding: 0 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(26, 115, 232, 0.28);
  backdrop-filter: blur(20px);
  box-shadow: 0 16px 40px rgba(26, 115, 232, 0.08);
}

:global(:root.dark) .navbar.capsule .nav-inner {
  background: rgba(34, 34, 36, 0.82);
  border-color: rgba(74, 158, 255, 0.34);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.24);
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
  font-size: 1.05rem;
  font-weight: 500;
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
