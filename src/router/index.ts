import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Blog from "../views/Blog.vue";
import Post from "../views/Post.vue";
import About from "../views/About.vue";
import Gallery from "../views/Gallery.vue";
import Tag from "../views/Tag.vue";
import NotFound from "../views/NotFound.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: Home },
    { path: "/blog", name: "blog", component: Blog },
    { path: "/blog/:slug(.*)", name: "post", component: Post },
    { path: "/gallery", name: "gallery", component: Gallery },
    { path: "/tags/:tag", name: "tag", component: Tag },
    { path: "/about", name: "about", component: About },
    { path: "/:pathMatch(.*)*", name: "not-found", component: NotFound },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
