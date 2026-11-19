import { ref, watch } from "vue";

const isDark = ref(false);
const THEME_KEY = "blog-theme";
let initialized = false;

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
}

// 只注册一次：之前写在 useTheme() 里，每个调用方都会多挂一个 watcher
watch(isDark, applyTheme);

export function useTheme() {
  function init() {
    if (initialized) return;
    initialized = true;

    // 优先读取本地存储，其次系统偏好
    const saved = localStorage.getItem(THEME_KEY);
    isDark.value =
      saved !== null
        ? saved === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(isDark.value);
  }

  function toggle() {
    isDark.value = !isDark.value;
  }

  return { isDark, toggle, init };
}
