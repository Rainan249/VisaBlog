import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Blog from "../views/Blog.vue";
import Post from "../views/Post.vue";
import About from "../views/About.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: Home },
    { path: "/blog", name: "blog", component: Blog },
    { path: "/blog/:slug", name: "post", component: Post },
    { path: "/about", name: "about", component: About },
  ],
});

export default router;
