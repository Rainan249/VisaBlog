import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: () => import("../views/Home.vue") },
    { path: "/blog", name: "blog", component: () => import("../views/Blog.vue") },
    { path: "/blog/:slug(.*)", name: "post", component: () => import("../views/Post.vue") },
    { path: "/gallery", name: "gallery", component: () => import("../views/Gallery.vue") },
    { path: "/tags/:tag", name: "tag", component: () => import("../views/Tag.vue") },
    { path: "/about", name: "about", component: () => import("../views/About.vue") },
    { path: "/feedback", name: "feedback", component: () => import("../views/Feedback.vue") },
    { path: "/admin", name: "admin", component: () => import("../views/Admin.vue") },
    { path: "/:pathMatch(.*)*", name: "not-found", component: () => import("../views/NotFound.vue") },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
