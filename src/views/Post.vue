<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { getPostBySlug } from "../lib/posts";
import { renderMarkdown } from "../lib/markdown";
import { ElProgress } from "element-plus";
import hljs from "highlight.js";
import mediumZoom, { type Zoom } from "medium-zoom";
import "highlight.js/styles/github-dark-dimmed.min.css";
import { useTheme } from "../lib/useTheme";

const route = useRoute();
const { isDark } = useTheme();

const post = ref(getPostBySlug(route.params.slug as string));
const html = ref("");

const currentUrl = computed(() => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/blog/${post.value?.slug ?? ""}`;
});

const reading = computed(() => {
  const content = post.value?.content ?? "";
  const text = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!?\[[^\]]*\]\([^)]*\)/g, " ");
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const words = (text.replace(/[\u4e00-\u9fa5]/g, " ").match(/[A-Za-z0-9]+/g) || [])
    .length;
  const chars = cjk + words;
  return { chars, minutes: Math.max(1, Math.round(chars / 400)) };
});

/* ========================================
   Waline 评论
   ======================================== */

const walineServer = import.meta.env.VITE_WALINE_SERVER;
const walineEl = ref<HTMLElement | null>(null);
let waline: { update?: (o?: object) => void; destroy: () => void } | null = null;

async function mountWaline() {
  waline?.destroy();
  waline = null;
  if (!walineServer || !walineEl.value) return;

  const { init } = await import("@waline/client");
  await import("@waline/client/style");
  waline = init({
    el: walineEl.value,
    serverURL: walineServer,
    path: `/blog/${post.value?.slug ?? ""}`,
    pageview: true,
    dark: document.documentElement.classList.contains("dark")
      ? "html.dark"
      : false,
  });
}

/* ========================================
   返回顶部
   ======================================== */

const showTop = ref(false);
const readProgress = ref(0);

function onScroll() {
  showTop.value = window.scrollY > 400;

  const el = contentRef.value;
  if (!el) {
    readProgress.value = 0;
    return;
  }
  const rect = el.getBoundingClientRect();
  const total = el.offsetHeight - window.innerHeight + 200;
  const passed = 100 - rect.top;
  readProgress.value = total > 0
    ? Math.min(100, Math.max(0, (passed / total) * 100))
    : 100;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

let zoom: Zoom | null = null;

async function enhanceRepoCards() {
  const cards = document.querySelectorAll<HTMLElement>(".gh-repo-card[data-repo]");
  await Promise.all(
    Array.from(cards).map(async (card) => {
      const repo = card.dataset.repo ?? "";
      try {
        const res = await fetch(`https://api.github.com/repos/${repo}`);
        if (!res.ok) throw new Error(String(res.status));
        const d = await res.json();
        const desc = card.querySelector(".gh-repo-desc");
        if (desc) desc.textContent = d.description || "GitHub 仓库";
        const stars = card.querySelector(".gh-repo-stars");
        if (stars) stars.textContent = `★ ${d.stargazers_count ?? 0}`;
        const forks = card.querySelector(".gh-repo-forks");
        if (forks) forks.textContent = `⑂ ${d.forks_count ?? 0}`;
        const lang = card.querySelector(".gh-repo-lang");
        if (lang) lang.textContent = d.language ?? "";
      } catch {
        const stars = card.querySelector(".gh-repo-stars");
        if (stars) stars.textContent = "";
        const forks = card.querySelector(".gh-repo-forks");
        if (forks) forks.textContent = "";
      }
    })
  );
}

async function renderAndEnhance() {
  if (!post.value) {
    html.value = "";
    return;
  }
  html.value = await renderMarkdown(post.value.content);
  await nextTick();

  document.querySelectorAll(".post-content pre code").forEach((el) => {
    hljs.highlightElement(el as HTMLElement);
  });

  enhanceRepoCards();

  zoom?.detach();
  zoom = mediumZoom(".post-content img", {
    background: "rgba(0, 0, 0, 0.75)",
    margin: 24,
  });
}

async function loadPost(slug: string) {
  post.value = getPostBySlug(slug);
  observer?.disconnect();

  if (post.value) {
    document.title = `${post.value.title} · Rainan's ink`;
    await renderAndEnhance();
    tocItems.value = buildToc();
    collapsedGroups.value = new Set(collectParentIds(tocItems.value));
    activeId.value = "";
    setupObserver();
    await mountWaline();
  } else {
    html.value = "";
    tocItems.value = [];
  }
}

/* ========================================
   Table of Contents
   ======================================== */

interface TocItem {
  id: string;
  text: string;
  level: number;
  children: TocItem[];
}

const tocItems = ref<TocItem[]>([]);
const activeId = ref<string>("");
const collapsedGroups = ref<Set<string>>(new Set());
const contentRef = ref<HTMLElement | null>(null);
const tocNavRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

/** Extract h1/h2/h3 headings from the rendered content and assign IDs. */
function buildToc(): TocItem[] {
  if (!contentRef.value) return [];

  const headings = contentRef.value.querySelectorAll("h1, h2, h3");
  const items: TocItem[] = [];
  let currentH1: TocItem | null = null;
  let currentH2: TocItem | null = null;

  headings.forEach((heading, index) => {
    const tag = heading.tagName;
    const level = tag === "H1" ? 1 : tag === "H2" ? 2 : 3;
    const id = heading.id || `heading-${index}`;
    if (!heading.id) heading.id = id;

    const item: TocItem = {
      id,
      text: heading.textContent || "",
      level,
      children: [],
    };

    if (level === 1) {
      items.push(item);
      currentH1 = item;
      currentH2 = null;
    } else if (level === 2) {
      if (currentH1) {
        currentH1.children.push(item);
      } else {
        items.push(item);
      }
      currentH2 = item;
    } else if (level === 3) {
      if (currentH2) {
        currentH2.children.push(item);
      } else if (currentH1) {
        currentH1.children.push(item);
      }
    }
  });

  return items;
}

/** Set up IntersectionObserver to highlight the current section. */
function setupObserver() {
  observer?.disconnect();
  if (!contentRef.value) return;

  const headings = contentRef.value.querySelectorAll("h1, h2, h3");
  if (headings.length === 0) return;

  const visibleIds = new Set<string>();

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = (entry.target as HTMLElement).id;
        if (entry.isIntersecting) {
          visibleIds.add(id);
        } else {
          visibleIds.delete(id);
        }
      });

      if (visibleIds.size > 0) {
        let topId = "";
        let topPos = Infinity;
        visibleIds.forEach((id) => {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top < topPos) {
              topPos = rect.top;
              topId = id;
            }
          }
        });
        if (topId) activeId.value = topId;
      } else {
        // Nothing visible — activate the heading closest above the viewport
        let closestId = "";
        let closestPos = Infinity;
        headings.forEach((h) => {
          const rect = h.getBoundingClientRect();
          if (rect.top > 0 && rect.top < closestPos) {
            closestPos = rect.top;
            closestId = h.id;
          }
        });
        if (closestId) activeId.value = closestId;
      }
    },
    {
      rootMargin: "-80px 0px -30% 0px",
      threshold: 0,
    }
  );

  headings.forEach((h) => observer!.observe(h));
}

function toggleGroup(id: string) {
  const next = new Set(collapsedGroups.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  collapsedGroups.value = next;
}

function isCollapsed(id: string): boolean {
  return collapsedGroups.value.has(id);
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ block: "start" });
  }
  closeMobileToc();
}

/** Collect heading IDs that have children and should be collapsed (h2+, not h1). */
function collectParentIds(items: TocItem[]): string[] {
  const ids: string[] = [];
  for (const item of items) {
    if (item.children.length > 0) {
      ids.push(item.id);
      ids.push(...collectParentIds(item.children));
    }
  }
  return ids;
}

/* ========================================
   Optimization 1: Auto-expand parent when child is active
   ======================================== */

/** Find the parent ID of a given heading across the entire TOC tree. */
function findParentId(id: string): string | null {
  for (const item of tocItems.value) {
    for (const child of item.children) {
      if (child.id === id) return item.id;
      for (const gc of child.children) {
        if (gc.id === id) return child.id;
      }
    }
  }
  return null;
}

// Auto-expand parent when a child heading becomes active
watch(activeId, (id) => {
  if (!id) return;
  const parentId = findParentId(id);
  if (parentId && isCollapsed(parentId)) {
    const next = new Set(collapsedGroups.value);
    next.delete(parentId);
    collapsedGroups.value = next;
  }
});

/* ========================================
   Optimization 3: Expand / Collapse all
   ======================================== */

function hasAnyCollapsed(items: TocItem[]): boolean {
  for (const item of items) {
    if (item.children.length > 0 && isCollapsed(item.id)) return true;
    if (hasAnyCollapsed(item.children)) return true;
  }
  return false;
}

const allExpanded = computed(() => !hasAnyCollapsed(tocItems.value));

function expandAll() {
  collapsedGroups.value = new Set();
}

function collapseAll() {
  collapsedGroups.value = new Set(collectParentIds(tocItems.value));
}

/* ========================================
   Optimization 4: Copy chapter link — REMOVED
   ======================================== */

/* ========================================
   Optimization 5: Mobile floating TOC
   ======================================== */

const mobileTocOpen = ref(false);

function openMobileToc() {
  mobileTocOpen.value = true;
}

function closeMobileToc() {
  mobileTocOpen.value = false;
}

/* ========================================
   Optimization 6: Reading progress
   ======================================== */

const tocProgress = computed(() => {
  const allIds: string[] = [];
  function walk(items: TocItem[]) {
    for (const item of items) {
      allIds.push(item.id);
      for (const child of item.children) {
        if (child.level <= 2) {
          walk([child]);
        } else {
          allIds.push(child.id);
        }
      }
    }
  }
  walk(tocItems.value);

  const total = allIds.length;
  const idx = allIds.indexOf(activeId.value);
  const current = idx >= 0 ? idx + 1 : 0;
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return { current, total, percent };
});

/* ========================================
   Lifecycle
   ======================================== */

onMounted(() => {
  loadPost(route.params.slug as string);
  window.addEventListener("scroll", onScroll, { passive: true });
});

// Rebuild TOC when navigating to another post (component reuse)
watch(
  () => route.params.slug,
  (slug) => {
    loadPost(slug as string);
  }
);

onUnmounted(() => {
  observer?.disconnect();
  window.removeEventListener("scroll", onScroll);
  zoom?.detach();
  waline?.destroy();
});

// Auto-scroll sidebar to center the active item
watch(activeId, (id) => {
  if (!id || !tocNavRef.value) return;
  const link = tocNavRef.value.querySelector(`[href="#${id}"]`) as HTMLElement | null;
  if (!link) return;

  const container = tocNavRef.value;
  const linkRect = link.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const nextScrollTop =
    container.scrollTop +
    linkRect.top -
    containerRect.top -
    container.clientHeight / 2 +
    linkRect.height / 2;

  container.scrollTo({
    top: Math.max(0, nextScrollTop),
    behavior: "smooth",
  });
});
</script>

<template>
  <!-- Post Found -->
  <div
    class="post-page"
    :class="{ 'has-toc': tocItems.length > 0 }"
    v-if="post"
  >
    <!-- 阅读进度 -->
    <div class="reading-progress" :style="{ width: readProgress + '%' }"></div>

    <!-- Desktop Sidebar Table of Contents (left side) -->
    <aside class="toc-sidebar" v-if="tocItems.length > 0">
      <!-- Title row with progress & expand/collapse -->
      <div class="toc-header">
        <div class="toc-header-top">
          <span class="toc-title">CONTENTS</span>
          <span class="toc-counter">{{ tocProgress.current }} / {{ tocProgress.total }}</span>
          <div class="toc-toggle-all">
            <button
              class="toc-action-btn"
              :class="{ active: allExpanded }"
              @click="expandAll"
              title="全部展开"
              aria-label="全部展开"
            >
              <svg width="14" height="14" viewBox="0 0 14 14">
                <path d="M2 4L7 9L12 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button
              class="toc-action-btn"
              :class="{ active: !allExpanded }"
              @click="collapseAll"
              title="全部收起"
              aria-label="全部收起"
            >
              <svg width="14" height="14" viewBox="0 0 14 14">
                <path d="M2 9L7 4L12 9" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <!-- Thin progress bar -->
        <div class="toc-progress-bar">
          <ElProgress
            :percentage="tocProgress.percent"
            :stroke-width="2"
            :show-text="false"
            :color="isDark ? '#82aaff' : '#002fa7'"
          />
        </div>
      </div>

      <nav ref="tocNavRef">
        <ul class="toc-list">
          <template v-for="item in tocItems" :key="item.id">
            <li :class="['toc-group', 'toc-group--h' + item.level]">
              <!-- Heading row -->
              <div class="toc-row">
                <button
                  v-if="item.children.length > 0"
                  class="toc-chevron"
                  :class="{ collapsed: isCollapsed(item.id) }"
                  @click="toggleGroup(item.id)"
                  :aria-label="isCollapsed(item.id) ? '展开' : '收起'"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <span v-else class="toc-chevron toc-chevron--ghost"></span>

                <a
                  :class="['toc-link', 'toc-link--h' + item.level, { active: activeId === item.id }]"
                  @click.prevent="scrollToHeading(item.id)"
                  :href="'#' + item.id"
                >
                  {{ item.text }}
                </a>
              </div>

              <!-- Children (grid-animated) -->
              <div
                v-if="item.children.length > 0"
                class="toc-children"
                :class="{ collapsed: isCollapsed(item.id) }"
              >
                <div class="toc-children-inner">
                  <ul class="toc-children-list">
                    <template v-for="child in item.children" :key="child.id">
                      <!-- h3 leaf item -->
                      <li v-if="child.level === 3" class="toc-child-item">
                        <a
                          class="toc-link toc-link--h3"
                          :class="{ active: activeId === child.id }"
                          @click.prevent="scrollToHeading(child.id)"
                          :href="'#' + child.id"
                        >
                          {{ child.text }}
                        </a>
                      </li>

                      <!-- Nested h2 group -->
                      <li v-else :class="['toc-group', 'toc-group--h' + child.level]">
                        <div class="toc-row">
                          <button
                            v-if="child.children.length > 0"
                            class="toc-chevron"
                            :class="{ collapsed: isCollapsed(child.id) }"
                            @click="toggleGroup(child.id)"
                            :aria-label="isCollapsed(child.id) ? '展开' : '收起'"
                          >
                            <svg width="10" height="10" viewBox="0 0 10 10">
                              <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                          </button>
                          <span v-else class="toc-chevron toc-chevron--ghost"></span>
                          <a
                            :class="['toc-link', 'toc-link--h' + child.level, { active: activeId === child.id }]"
                            @click.prevent="scrollToHeading(child.id)"
                            :href="'#' + child.id"
                          >
                            {{ child.text }}
                          </a>
                        </div>
                        <!-- Grandchildren h3 -->
                        <div
                          v-if="child.children.length > 0"
                          class="toc-children"
                          :class="{ collapsed: isCollapsed(child.id) }"
                        >
                          <div class="toc-children-inner">
                            <ul class="toc-children-list">
                              <li v-for="gc in child.children" :key="gc.id" class="toc-child-item">
                                <a
                                  class="toc-link toc-link--h3"
                                  :class="{ active: activeId === gc.id }"
                                  @click.prevent="scrollToHeading(gc.id)"
                                  :href="'#' + gc.id"
                                >
                                  {{ gc.text }}
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                    </template>
                  </ul>
                </div>
              </div>
            </li>
          </template>
        </ul>
      </nav>
    </aside>

    <!-- Article -->
    <article>
      <header class="post-header">
        <h1>{{ post.title }}</h1>
        <div class="post-meta">
          <time>{{ post.date }}</time>
          <span>共 {{ reading.chars }} 字 · 约 {{ reading.minutes }} 分钟</span>
          <span v-for="tag in post.tags" :key="tag" class="tag">
            <RouterLink :to="`/tags/${encodeURIComponent(tag)}`" class="tag-link">{{ tag }}</RouterLink>
          </span>
        </div>
      </header>
      <div v-if="!html" class="post-skeleton">
        <div class="sk sk-title"></div>
        <div class="sk sk-meta"></div>
        <div class="sk sk-line" v-for="n in 7" :key="n" :style="{ width: 100 - ((n * 7) % 24) + '%' }"></div>
      </div>
      <div v-else ref="contentRef" class="post-content" v-html="html"></div>

      <div class="post-footer">
        <div class="post-copyright">
          <p><strong>本文作者</strong>Rainan</p>
          <p><strong>本文链接</strong><a :href="currentUrl">{{ currentUrl }}</a></p>
          <p><strong>版权声明</strong>本博客所有文章除特别声明外，均采用 CC BY-NC-SA 4.0 许可协议，转载请注明出处！</p>
        </div>
        <div v-if="walineServer" ref="walineEl" class="post-comments"></div>
      </div>
    </article>

    <!-- 返回顶部 -->
    <button
      class="back-to-top"
      v-show="showTop"
      @click="scrollToTop"
      aria-label="返回顶部"
      title="返回顶部"
    >
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path d="M4 11L9 6l5 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <!-- Mobile floating TOC button -->
    <button
      class="toc-mobile-fab"
      @click="openMobileToc"
      aria-label="打开目录"
      title="目录"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="3" width="16" height="2" rx="1" fill="currentColor" />
        <rect x="2" y="9" width="12" height="2" rx="1" fill="currentColor" />
        <rect x="2" y="15" width="14" height="2" rx="1" fill="currentColor" />
      </svg>
    </button>

    <!-- Mobile TOC overlay -->
    <Teleport to="body">
      <Transition name="toc-slide">
        <div v-if="mobileTocOpen" class="toc-mobile-overlay">
          <div class="toc-mobile-backdrop" @click="closeMobileToc"></div>
          <aside class="toc-mobile-panel">
            <div class="toc-mobile-header">
              <span class="toc-mobile-title">CONTENTS</span>
              <span class="toc-counter toc-counter--mobile">{{ tocProgress.current }} / {{ tocProgress.total }}</span>
              <button class="toc-mobile-close" @click="closeMobileToc" aria-label="关闭">
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </button>
            </div>

            <!-- Progress bar -->
            <div class="toc-progress-bar toc-progress-bar--mobile">
              <ElProgress
                :percentage="tocProgress.percent"
                :stroke-width="2"
                :show-text="false"
                :color="isDark ? '#82aaff' : '#002fa7'"
              />
            </div>

            <div class="toc-mobile-actions">
              <button class="toc-action-btn toc-action-btn--mobile" @click="expandAll">全部展开</button>
              <button class="toc-action-btn toc-action-btn--mobile" @click="collapseAll">全部收起</button>
            </div>

            <nav>
              <ul class="toc-list">
                <template v-for="item in tocItems" :key="item.id">
                  <li :class="['toc-group', 'toc-group--h' + item.level]">
                    <div class="toc-row">
                      <button
                        v-if="item.children.length > 0"
                        class="toc-chevron"
                        :class="{ collapsed: isCollapsed(item.id) }"
                        @click="toggleGroup(item.id)"
                        :aria-label="isCollapsed(item.id) ? '展开' : '收起'"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10">
                          <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </button>
                      <span v-else class="toc-chevron toc-chevron--ghost"></span>
                      <a
                        :class="['toc-link', 'toc-link--h' + item.level, { active: activeId === item.id }]"
                        @click.prevent="scrollToHeading(item.id)"
                        :href="'#' + item.id"
                      >
                        {{ item.text }}
                      </a>
                    </div>
                    <div
                      v-if="item.children.length > 0"
                      class="toc-children"
                      :class="{ collapsed: isCollapsed(item.id) }"
                    >
                      <div class="toc-children-inner">
                        <ul class="toc-children-list">
                          <template v-for="child in item.children" :key="child.id">
                            <li v-if="child.level === 3" class="toc-child-item">
                              <a
                                class="toc-link toc-link--h3"
                                :class="{ active: activeId === child.id }"
                                @click.prevent="scrollToHeading(child.id)"
                                :href="'#' + child.id"
                              >
                                {{ child.text }}
                              </a>
                            </li>
                            <li v-else :class="['toc-group', 'toc-group--h' + child.level]">
                              <div class="toc-row">
                                <button
                                  v-if="child.children.length > 0"
                                  class="toc-chevron"
                                  :class="{ collapsed: isCollapsed(child.id) }"
                                  @click="toggleGroup(child.id)"
                                  :aria-label="isCollapsed(child.id) ? '展开' : '收起'"
                                >
                                  <svg width="10" height="10" viewBox="0 0 10 10">
                                    <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                                  </svg>
                                </button>
                                <span v-else class="toc-chevron toc-chevron--ghost"></span>
                                <a
                                  :class="['toc-link', 'toc-link--h' + child.level, { active: activeId === child.id }]"
                                  @click.prevent="scrollToHeading(child.id)"
                                  :href="'#' + child.id"
                                >
                                  {{ child.text }}
                                </a>
                              </div>
                              <div
                                v-if="child.children.length > 0"
                                class="toc-children"
                                :class="{ collapsed: isCollapsed(child.id) }"
                              >
                                <div class="toc-children-inner">
                                  <ul class="toc-children-list">
                                    <li v-for="gc in child.children" :key="gc.id" class="toc-child-item">
                                      <a
                                        class="toc-link toc-link--h3"
                                        :class="{ active: activeId === gc.id }"
                                        @click.prevent="scrollToHeading(gc.id)"
                                        :href="'#' + gc.id"
                                      >
                                        {{ gc.text }}
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </li>
                          </template>
                        </ul>
                      </div>
                    </div>
                  </li>
                </template>
              </ul>
            </nav>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </div>

  <!-- Not Found -->
  <div class="not-found" v-else>
    <h1>文章不存在</h1>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<style scoped>
/* ========================================
   Layout
   ======================================== */

.post-page {
  max-width: 680px;
  margin: 0 auto;
  padding: 48px 24px;
}

.post-page.has-toc {
  max-width: none;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 0;
}

.post-page.has-toc article {
  max-width: 680px;
  width: 100%;
  min-width: 0;
}

/* ========================================
   Post Header & Content
   ======================================== */

/* 阅读进度条 */
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--accent);
  box-shadow: 0 0 8px rgba(var(--accent-rgb), 0.5);
  z-index: 999;
  transition: width 0.1s linear;
  pointer-events: none;
}

/* 骨架屏 */
.post-skeleton {
  padding-top: 8px;
}

.sk {
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    var(--border) 25%,
    var(--bg-secondary) 37%,
    var(--border) 63%
  );
  background-size: 400% 100%;
  animation: sk-shimmer 1.4s ease infinite;
}

.sk-title {
  height: 34px;
  width: 62%;
  margin-bottom: 14px;
}

.sk-meta {
  height: 14px;
  width: 32%;
  margin-bottom: 34px;
}

.sk-line {
  height: 15px;
  margin-bottom: 14px;
}

@keyframes sk-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.post-header {
  margin-bottom: 32px;
}

.post-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 12px;
  line-height: 1.3;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.875rem;
  color: var(--text-tertiary);
}

.tag {
  background: var(--tag-bg);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.tag-link {
  color: inherit;
  text-decoration: none;
}

.tag-link:hover {
  color: var(--accent);
  text-decoration: none;
}

.post-content {
  line-height: 1.8;
  font-size: 1.05rem;
}

.post-content :deep(h1),
.post-content :deep(h2),
.post-content :deep(h3) {
  scroll-margin-top: 96px;
}

.post-content :deep(h1) {
  font-size: 1.8rem;
  margin: 40px 0 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(var(--accent-rgb), 0.2);
  color: var(--accent);
}

.post-content :deep(h2) {
  font-size: 1.4rem;
  margin: 32px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(var(--accent-rgb), 0.2);
  color: var(--accent);
}

.post-content :deep(h3) {
  font-size: 1.2rem;
  margin: 24px 0 12px;
  color: var(--accent-soft);
}

.post-content :deep(p) {
  margin: 0 0 16px;
}

.post-content :deep(code) {
  background: var(--code-inline-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

/* ===== 代码块增强 ===== */

.post-content :deep(.code-block-wrap) {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #3a3a3a;
}

.post-content :deep(.code-block-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 14px;
  background: #2a2a2a;
  font-size: 0.78rem;
}

.post-content :deep(.code-lang) {
  color: #999;
  font-weight: 500;
  text-transform: lowercase;
}

.post-content :deep(.code-copy-btn) {
  background: none;
  border: 1px solid rgba(255,255,255,0.08);
  color: #888;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 0.72rem;
  cursor: none;
  transition: color 0.2s;
}

.post-content :deep(.code-copy-btn:hover) {
  color: #ccc;
  border-color: rgba(255,255,255,0.2);
}

.post-content :deep(pre) {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  margin: 0;
  overflow-x: auto;
}

.post-content :deep(pre code) {
  background: none;
  padding: 0;
  font-size: 0.9rem;
}

.post-content :deep(blockquote) {
  margin: 16px 0;
  padding: 12px 16px;
  border-left: 1px solid rgba(var(--accent-rgb), 0.35);
  background: var(--blockquote-bg);
  color: var(--text-secondary);
}

.post-content :deep(ul),
.post-content :deep(ol) {
  margin: 0 0 16px;
  padding-left: 24px;
}

.post-content :deep(li) {
  margin-bottom: 4px;
}

.post-content :deep(a) {
  color: var(--accent);
}

.post-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}

/* ===== 表格 ===== */

.post-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  margin: 16px 0;
  display: block;
  overflow-x: auto;
  white-space: nowrap;
}

.post-content :deep(th),
.post-content :deep(td) {
  border: 1px solid var(--border, #e0e0e0);
  padding: 8px 14px;
  text-align: left;
}

.post-content :deep(th) {
  background: var(--bg-secondary, #f5f5f5);
  font-weight: 600;
}

.post-content :deep(tr:nth-child(even)) {
  background: var(--bg-secondary, #fafafa);
}

/* ===== 文末版权 & 评论 ===== */

.post-footer {
  margin-top: 48px;
}

.post-copyright {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-secondary);
  padding: 14px 18px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.8;
}

.post-copyright p {
  margin: 0;
}

.post-copyright strong {
  margin-right: 10px;
  color: var(--text);
  font-weight: 600;
}

.post-copyright a {
  color: var(--accent);
  word-break: break-all;
}

.post-comments {
  margin-top: 32px;
}

/* ========================================
   Back to top
   ======================================== */

.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--card-bg);
  color: var(--text-secondary);
  cursor: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  z-index: 997;
  transition: color 0.2s, border-color 0.2s, transform 0.2s;
}

.back-to-top:hover {
  color: var(--accent);
  border-color: var(--accent);
  transform: translateY(-2px);
}

/* ========================================
   Desktop Sidebar – Table of Contents
   ======================================== */

.toc-sidebar {
  position: fixed;
  left: 32px;
  top: 40px;
  width: 230px;
  flex-shrink: 0;
  font-size: 0.85rem;
  scrollbar-gutter: stable;
  padding-right: 4px;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

.toc-sidebar nav {
  flex: 1;
  overflow-y: auto;
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
  padding: 8px 0 16px;
}

/* ---------- Header (title + counter + actions) ---------- */

.toc-header {
  margin-bottom: 10px;
}

.toc-header-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.toc-title {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #aaa;
  font-weight: 600;
  text-align: center;
  flex-shrink: 0;
}

.toc-counter {
  font-size: 0.68rem;
  color: #bbb;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.toc-toggle-all {
  margin-left: auto;
  display: flex;
  gap: 4px;
}

.toc-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--card-bg);
  color: var(--text-tertiary);
  padding: 0;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.toc-action-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: rgba(var(--accent-rgb), 0.04);
}

.toc-action-btn.active {
  color: var(--accent);
  border-color: var(--accent);
  background: rgba(var(--accent-rgb), 0.06);
}

/* ---------- Progress bar ---------- */

.toc-progress-bar {
  margin-bottom: 10px;
}

.toc-progress-bar :deep(.el-progress-bar__outer) {
  background: var(--border);
  border-radius: 1px;
}

.toc-progress-bar :deep(.el-progress-bar__inner) {
  border-radius: 1px;
}

/* ---------- List ---------- */

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* ---------- Group ---------- */

.toc-group {
  position: relative;
  margin-bottom: 8px;
}

.toc-group--h1 { padding-left: 0; }
.toc-group--h2 { padding-left: 18px; }

/* ---------- Row ---------- */

.toc-row {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  position: relative;
}

/* ---------- Chevron ---------- */

.toc-chevron {
  flex-shrink: 0;
  width: 14px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #bbb;
  padding: 0;
  margin-top: 4px;
  transition: transform 0.25s ease, color 0.15s;
}

.toc-chevron:hover { color: #002fa7; }
.toc-chevron.collapsed { transform: rotate(-90deg); }
.toc-chevron--ghost { visibility: hidden; }

/* ---------- Links ---------- */

.toc-link {
  position: relative;
  display: block;
  width: 100%;
  padding: 4px 8px;
  border-radius: 6px;
  text-decoration: none;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.toc-link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.toc-link--h2 {
  color: rgba(0, 47, 167, 0.72);
  line-height: 1.45;
  font-weight: 500;
  font-size: 0.85rem;
}

.toc-link--h2:hover { color: #002fa7; background-color: rgba(0, 47, 167, 0.06); }

.toc-link--h1 {
  color: #002fa7;
  line-height: 1.45;
  font-weight: 600;
  font-size: 0.9rem;
}

.toc-link--h1:hover { color: #002fa7; background-color: rgba(0, 47, 167, 0.08); }

.toc-link.active {
  padding-left: 20px;
}

.toc-link.active::before {
  content: "";
  position: absolute;
  left: 8px;
  top: 50%;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  transform: translateY(-50%);
}

.toc-link--h1.active {
  color: #002fa7;
  background-color: rgba(0, 47, 167, 0.12);
  font-weight: 600;
}

.toc-link--h2.active {
  color: #002fa7;
  background-color: rgba(0, 47, 167, 0.1);
  font-weight: 500;
}

/* ---------- Grid-animated children container ---------- */

.toc-children {
  display: grid;
  grid-template-rows: 1fr;
  opacity: 1;
  transition: grid-template-rows 0.3s ease, opacity 0.2s ease;
}

.toc-children.collapsed {
  grid-template-rows: 0fr;
  opacity: 0;
}

.toc-children-inner {
  overflow: hidden;
  min-height: 0;
}

.toc-children-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* ---------- h3 child item ---------- */

.toc-child-item {
  position: relative;
  padding-left: 36px;
  margin-bottom: 1px;
}

.toc-link--h3 {
  color: rgba(0, 47, 167, 0.45);
  line-height: 1.4;
  font-size: 0.78rem;
  font-weight: 400;
}

.toc-link--h3:hover { color: rgba(0, 47, 167, 0.7); background-color: rgba(0, 47, 167, 0.06); }

.toc-link--h3.active {
  color: rgba(0, 47, 167, 0.72);
  background-color: rgba(0, 47, 167, 0.1);
  font-weight: 500;
}

/* ========================================
   Mobile FAB button
   ======================================== */

.toc-mobile-fab {
  display: none;
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--bg);
  border: none;
  box-shadow: 0 4px 16px rgba(var(--accent-rgb), 0.35);
  z-index: 998;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.toc-mobile-fab:active {
  transform: scale(0.94);
  box-shadow: 0 2px 8px rgba(var(--accent-rgb), 0.25);
}

/* ========================================
   Mobile TOC overlay
   ======================================== */

.toc-mobile-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.toc-mobile-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.toc-mobile-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  max-width: 85vw;
  background: var(--card-bg);
  padding: 20px 24px;
  overflow-y: auto;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 1001;
}

.toc-mobile-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.toc-mobile-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}

.toc-counter--mobile {
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

.toc-mobile-close {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
}

.toc-mobile-close:hover {
  color: var(--text);
  background: var(--bg-secondary);
}

.toc-progress-bar--mobile {
  margin-bottom: 12px;
}

.toc-mobile-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.toc-action-btn--mobile {
  width: auto;
  height: 28px;
  padding: 0 10px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--card-bg);
  color: var(--text-secondary);
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.toc-action-btn--mobile:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: rgba(var(--accent-rgb), 0.04);
}

/* Slide-in transition */
.toc-slide-enter-active,
.toc-slide-leave-active {
  transition: opacity 0.25s ease;
}

.toc-slide-enter-active .toc-mobile-panel,
.toc-slide-leave-active .toc-mobile-panel {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toc-slide-enter-from,
.toc-slide-leave-to {
  opacity: 0;
}

.toc-slide-enter-from .toc-mobile-panel,
.toc-slide-leave-to .toc-mobile-panel {
  transform: translateX(100%);
}

/* ========================================
   404 Page
   ======================================== */

.not-found {
  text-align: center;
  padding: 80px 24px;
}

.not-found h1 {
  font-size: 1.5rem;
  margin-bottom: 16px;
}

/* ========================================
   Responsive
   ======================================== */

@media (max-width: 900px) {
  .post-page.has-toc {
    display: block;
    max-width: 680px;
  }

  .toc-sidebar {
    display: none;
  }

  .toc-mobile-fab {
    display: flex;
  }

  .back-to-top {
    bottom: 84px;
  }
}
</style>
