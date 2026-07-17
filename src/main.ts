import { createApp } from "vue";
import "./style.css";
import "element-plus/dist/index.css";
import App from "./App.vue";
import router from "./router";
import { useTheme } from "./lib/useTheme";

const app = createApp(App);
app.use(router);
app.mount("#app");

// 初始化主题
useTheme().init();
