<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import CursorTrail from "../components/CursorTrail.vue";
import galleryData from "virtual:gallery-data";

const activeCategory = ref("");
let sectionObserver: IntersectionObserver | null = null;

function scrollToCategory(name: string) {
  activeCategory.value = name;
  const element = document.getElementById(name);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

onMounted(() => {
  document.title = "GALLERY · Rainan's ink";
  document.addEventListener("keydown", handleKeydown);

  // IntersectionObserver 追踪当前可见分类
  sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeCategory.value = entry.target.id;
        }
      }
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
  );
  galleryData.forEach((c) => {
    const el = document.getElementById(c.name);
    if (el) sectionObserver!.observe(el);
  });
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  sectionObserver?.disconnect();
});

const selectedImage = ref<string | null>(null);
const selectedIndex = ref(0);
const currentCategoryImages = ref<string[]>([]);

function openPreview(img: string, images: string[]) {
  selectedImage.value = img;
  currentCategoryImages.value = images;
  selectedIndex.value = images.indexOf(img);
  document.body.style.overflow = "hidden";
}

function closePreview() {
  selectedImage.value = null;
  document.body.style.overflow = "";
}

function prevImage() {
  if (selectedIndex.value > 0) {
    selectedIndex.value--;
    selectedImage.value = currentCategoryImages.value[selectedIndex.value];
  }
}

function nextImage() {
  if (selectedIndex.value < currentCategoryImages.value.length - 1) {
    selectedIndex.value++;
    selectedImage.value = currentCategoryImages.value[selectedIndex.value];
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (!selectedImage.value) return;

  switch (e.key) {
    case "Escape":
      closePreview();
      break;
    case "ArrowLeft":
      prevImage();
      break;
    case "ArrowRight":
      nextImage();
      break;
  }
}
</script>

<template>
  <CursorTrail />
  <div class="gallery">
    <header class="gallery-header">
      <h1>GALLERY</h1>
      <p>A collection of my works and moments</p>
    </header>

    <div class="gallery-sections">
      <!-- 顶部分类导航 -->
      <nav class="category-nav">
        <button
          class="tag-btn"
          :class="{ active: activeCategory === '' }"
          @click="activeCategory = ''; window.scrollTo({ top: 0, behavior: 'smooth' })"
        >全部</button>
        <button
          v-for="category in galleryData"
          :key="category.name"
          class="tag-btn"
          :class="{ active: activeCategory === category.name }"
          @click="scrollToCategory(category.name)"
        >{{ category.name }}</button>
      </nav>

      <section v-for="category in galleryData" :key="category.name" class="gallery-section">
        <h2 class="section-title" :id="category.name">{{ category.name }}</h2>

        <template v-for="sub in category.subcategories" :key="sub.name">
          <!-- 有子分类时显示子标题 -->
          <h3 v-if="sub.name" class="sub-section-title" :id="sub.name">{{ sub.name }}</h3>

          <div class="photo-grid">
            <div
              v-for="(img, index) in sub.images"
              :key="index"
              class="photo-item"
              @click="openPreview(img, sub.images)"
            >
              <img :src="img" :alt="sub.name || category.name" loading="lazy" />
            </div>
          </div>
        </template>
      </section>
    </div>
  </div>

  <!-- 图片预览模态框 -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="selectedImage" class="preview-overlay" @click.self="closePreview">
        <button class="preview-close" @click="closePreview">&times;</button>

        <!-- 左右切换按钮 -->
        <button
          v-if="selectedIndex > 0"
          class="preview-nav preview-prev"
          @click="prevImage"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <div class="preview-image-wrapper" @click="closePreview">
          <img
            :src="selectedImage"
            class="preview-image"
          />
        </div>

        <button
          v-if="selectedIndex < currentCategoryImages.length - 1"
          class="preview-nav preview-next"
          @click="nextImage"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- 图片计数器 -->
        <div class="preview-counter">
          {{ selectedIndex + 1 }} / {{ currentCategoryImages.length }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.gallery {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 24px;
}

.gallery-header {
  margin-bottom: 48px;
}

.gallery-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0;
}

.gallery-header p {
  color: #666;
  margin: 8px 0 0;
  font-size: 1.05rem;
}

.gallery-sections {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.category-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.tag-btn {
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid #e0e0e0;
  background: transparent;
  color: #666;
  font-size: 0.95rem;
  cursor: none;
  transition: all 0.2s;
}

.tag-btn:hover {
  border-color: #1a73e8;
  color: #1a73e8;
}

.tag-btn.active {
  background: #1a73e8;
  border-color: #1a73e8;
  color: #fff;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #262628;
  margin: 0 0 20px;
  padding-left: 12px;
  border-left: 3px solid #1a73e8;
}

.sub-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #444;
  margin: 24px 0 12px;
  padding-left: 8px;
  border-left: 2px solid #999;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.photo-item {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f7fa;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.photo-item:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 80px 0;
}

/* 预览模态框 */
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
}

.preview-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 10;
}

.preview-close:hover {
  background: rgba(255, 255, 255, 0.25);
}

.preview-image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.preview-image {
  max-width: 85vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
  user-select: none;
}

/* 左右切换按钮 */
.preview-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
  z-index: 10;
}

.preview-nav:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-50%) scale(1.1);
}

.preview-prev {
  left: 24px;
}

.preview-next {
  right: 24px;
}

/* 图片计数器 */
.preview-counter {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
