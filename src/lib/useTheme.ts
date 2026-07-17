import { ref, watch } from "vue";

const isDark = ref(false);

const THEME_KEY = "blog-theme";

export function useTheme() {
  function init() {
    // 优先读取本地存储，其次系统偏好
    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== null) {
      isDark.value = saved === "dark";
    } else {
      isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    applyTheme(isDark.value);
  }

  function toggle() {
    isDark.value = !isDark.value;
  }

  function applyTheme(dark: boolean) {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }

  watch(isDark, applyTheme);

  return { isDark, toggle, init };
}
