<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { getPostBySlug } from "../lib/posts";
import { marked } from "marked";

const route = useRoute();
const slug = route.params.slug as string;
const post = getPostBySlug(slug);

if (post) {
  document.title = post.title;
}

const html = post ? marked.parse(post.content) : "";

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
const tocRef = ref<HTMLElement | null>(null);
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
      // Track which headings are currently in the observation zone
      entries.forEach((entry) => {
        const id = (entry.target as HTMLElement).id;
        if (entry.isIntersecting) {
          visibleIds.add(id);
        } else {
          visibleIds.delete(id);
        }
      });

      if (visibleIds.size > 0) {
        // Pick the top-most visible heading
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
}

/** Collect heading IDs that have children and should be collapsed (h2+, not h1). */
function collectParentIds(items: TocItem[]): string[] {
  const ids: string[] = [];
  for (const item of items) {
    if (item.children.length > 0) {
      if (item.level > 1) ids.push(item.id); // collapse h2/h3, keep h1 open
      ids.push(...collectParentIds(item.children));
    }
  }
  return ids;
}

// Initialise on mount
onMounted(async () => {
  await nextTick();
  tocItems.value = buildToc();
  collapsedGroups.value = new Set(collectParentIds(tocItems.value));
  setupObserver();
});

// Rebuild TOC when navigating to another post (component reuse)
watch(
  () => route.params.slug,
  async () => {
    await nextTick();
    tocItems.value = buildToc();
    collapsedGroups.value = new Set(collectParentIds(tocItems.value));
    activeId.value = "";
    setupObserver();
  }
);

onUnmounted(() => {
  observer?.disconnect();
});

// Auto-scroll sidebar to center the active item (without forcing reflow)
watch(activeId, (id) => {
  if (!id || !tocRef.value) return;
  const link = tocRef.value.querySelector(`[href="#${id}"]`) as HTMLElement | null;
  if (!link) return;

  const container = tocRef.value;
  const linkRect = link.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  // Only scroll if link is outside the visible area
  if (linkRect.top < containerRect.top || linkRect.bottom > containerRect.bottom) {
    container.scrollTop += linkRect.top - containerRect.top - containerRect.height / 2 + linkRect.height / 2;
  }
});
</script>

<template>
  <!-- Post Found -->
  <div
    class="post-page"
    :class="{ 'has-toc': tocItems.length > 0 }"
    v-if="post"
  >
    <!-- Sidebar Table of Contents (left side) -->
    <aside ref="tocRef" class="toc-sidebar" v-if="tocItems.length > 0">
      <div class="toc-title">目录</div>

      <nav>
        <ul class="toc-list">
          <li v-for="item in tocItems" :key="item.id" :class="['toc-group', 'toc-group--h' + item.level]">
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
                  <path
                    d="M3 2L7 5L3 8"
                    stroke="currentColor"
                    stroke-width="1.5"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
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

            <!-- Children (recursive: h2 under h1, h3 under h2) -->
            <ul
              v-if="item.children.length > 0"
              class="toc-children"
              :class="{ collapsed: isCollapsed(item.id) }"
            >
              <template v-for="child in item.children" :key="child.id">
                <!-- h3 rendered as child item -->
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
                <!-- h2 rendered as nested group -->
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
                  <!-- h3 children under h2 -->
                  <ul v-if="child.children.length > 0" class="toc-children" :class="{ collapsed: isCollapsed(child.id) }">
                    <li v-for="grandchild in child.children" :key="grandchild.id" class="toc-child-item">
                      <a
                        class="toc-link toc-link--h3"
                        :class="{ active: activeId === grandchild.id }"
                        @click.prevent="scrollToHeading(grandchild.id)"
                        :href="'#' + grandchild.id"
                      >
                        {{ grandchild.text }}
                      </a>
                    </li>
                  </ul>
                </li>
              </template>
            </ul>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Article -->
    <article>
      <header class="post-header">
        <h1>{{ post.title }}</h1>
        <div class="post-meta">
          <time>{{ post.date }}</time>
          <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </header>
      <div ref="contentRef" class="post-content" v-html="html"></div>
    </article>
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

/* Wider flex layout when TOC is present */
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
   Post Header & Content (unchanged)
   ======================================== */

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
  color: #888;
}

.tag {
  background: #f0f0f0;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #555;
}

.post-content {
  line-height: 1.8;
  font-size: 1.05rem;
}

/* Inject IDs into heading scroll target so IntersectionObserver can track them */
.post-content :deep(h1),
.post-content :deep(h2),
.post-content :deep(h3) {
  scroll-margin-top: 96px;
}

.post-content :deep(h1) {
  font-size: 1.8rem;
  margin: 40px 0 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(124,58,237,0.2);
  color: #7c3aed;
}

.post-content :deep(h2) {
  font-size: 1.4rem;
  margin: 32px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(26,115,232,0.2);
  color: #1a73e8;
}

.post-content :deep(h3) {
  font-size: 1.2rem;
  margin: 24px 0 12px;
  color: #0d9488;
}

.post-content :deep(p) {
  margin: 0 0 16px;
}

.post-content :deep(code) {
  background: #f4f4f4;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.post-content :deep(pre) {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

.post-content :deep(pre code) {
  background: none;
  padding: 0;
  font-size: 0.9rem;
}

.post-content :deep(blockquote) {
  margin: 16px 0;
  padding: 8px 16px;
  border-left: 4px solid #1a73e8;
  background: #f8f9fa;
  color: #555;
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
  color: #1a73e8;
}

.post-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}

/* ========================================
   Table of Contents Sidebar
   ======================================== */

.toc-sidebar {
  position: fixed;
  left: 24px;
  top: 100px;
  width: 200px;
  flex-shrink: 0;
  font-size: 0.85rem;

  /* Scroll internally if TOC is very long */
  max-height: calc(100vh - 140px);
  overflow-y: auto;
}

/* ---------- Title ---------- */

.toc-title {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #aaa;
  margin-bottom: 14px;
  font-weight: 600;
  text-align: center;
}

/* ---------- List ---------- */

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* ---------- Group (heading + children) ---------- */

.toc-group {
  position: relative;
  margin-bottom: 2px;
}

/* Indentation per heading level */
.toc-group--h1 { padding-left: 8px; }
.toc-group--h2 { padding-left: 24px; }

/* Continuous vertical line from heading through children */
.toc-group::before {
  content: "";
  position: absolute;
  left: 2px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #1a73e8;
  opacity: 0.4;
  border-radius: 1px;
}

/* Line color per heading level */
.toc-group--h1::before {
  background: #7c3aed;
}
.toc-group--h2::before {
  background: #1a73e8;
}

/* Highlight line when heading or any child h3 is active */
.toc-group--h1:has(.toc-link--h1.active)::before,
.toc-group--h2:has(.toc-link--h2.active)::before,
.toc-group--h1:has(.toc-link--h3.active)::before,
.toc-group--h2:has(.toc-link--h3.active)::before {
  opacity: 1;
}

/* ---------- h2 row ---------- */

.toc-row {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  position: relative;
}

/* Connector from vertical line to heading text - per level */
.toc-group--h1 .toc-row::before {
  content: "";
  position: absolute;
  left: -6px;
  top: 50%;
  width: 6px;
  height: 2px;
  background: #7c3aed;
  opacity: 0.4;
  border-radius: 1px;
  transform: translateY(-50%);
}

.toc-group--h2 .toc-row::before {
  content: "";
  position: absolute;
  left: -22px;
  top: 50%;
  width: 20px;
  height: 2px;
  background: #1a73e8;
  opacity: 0.4;
  border-radius: 1px;
  transform: translateY(-50%);
}

/* Connector highlight when active */
.toc-group--h1:has(.toc-link--h1.active) > .toc-row::before,
.toc-group--h1:has(.toc-link--h3.active) > .toc-row::before {
  opacity: 1;
}
.toc-group--h2:has(.toc-link--h2.active) > .toc-row::before,
.toc-group--h2:has(.toc-link--h3.active) > .toc-row::before {
  opacity: 1;
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

.toc-chevron:hover {
  color: #1a73e8;
}

.toc-chevron.collapsed {
  transform: rotate(-90deg);
}

.toc-chevron--ghost {
  visibility: hidden;
}

/* ---------- h2 Link ---------- */

.toc-link--h2 {
  display: block;
  padding: 3px 6px;
  color: #1a73e8;
  text-decoration: none;
  line-height: 1.45;
  font-weight: 500;
  font-size: 0.85rem;
  border-radius: 3px;
  transition: color 0.15s, background 0.15s;
}

.toc-link--h2:hover {
  color: #1557b0;
  background: rgba(26,115,232,0.05);
}

.toc-link--h2.active {
  color: #1a73e8;
  font-weight: 600;
}

/* ---------- h1 Link ---------- */

.toc-link--h1 {
  display: block;
  padding: 3px 6px;
  color: #7c3aed;
  text-decoration: none;
  line-height: 1.45;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 3px;
  transition: color 0.15s, background 0.15s;
}

.toc-link--h1:hover {
  color: #6d28d9;
  background: rgba(124,58,237,0.05);
}

.toc-link--h1.active {
  color: #6d28d9;
  font-weight: 700;
}

/* ---------- h3 children container ---------- */

.toc-children {
  list-style: none;
  padding: 0 0 0 8px;
  margin: 0;
  overflow: hidden;
  max-height: 600px;
  opacity: 1;
  transition: max-height 0.35s ease, opacity 0.2s ease;
}

.toc-children.collapsed {
  max-height: 0;
  opacity: 0;
}

/* ---------- h3 child item ---------- */

.toc-child-item {
  position: relative;
  padding-left: 24px;
  margin-bottom: 1px;
}

/* Connector from vertical line to h3 text */
.toc-child-item::before {
  content: "";
  position: absolute;
  left: -16px;
  top: 50%;
  width: 14px;
  height: 2px;
  background: #0d9488;
  opacity: 0.4;
  border-radius: 1px;
  transform: translateY(-50%);
}

/* Highlight connector when h3 active */
.toc-child-item:has(.toc-link--h3.active)::before {
  opacity: 1;
  background: #0d9488;
}

.toc-link--h3 {
  display: block;
  padding: 2px 6px;
  font-size: 0.78rem;
  color: #0d9488;
  text-decoration: none;
  line-height: 1.4;
  border-radius: 3px;
  transition: color 0.15s, background 0.15s;
}

.toc-link--h3:hover {
  color: #0f766e;
  background: rgba(13,148,136,0.05);
}

.toc-link--h3.active {
  color: #0d9488;
  font-weight: 500;
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
   Responsive: hide sidebar on narrow screens
   ======================================== */

@media (max-width: 900px) {
  .post-page.has-toc {
    display: block;
    max-width: 680px;
  }

  .toc-sidebar {
    display: none;
  }
}
</style>
