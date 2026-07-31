<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import CursorTrail from "../components/CursorTrail.vue";

onMounted(() => {
  document.title = "GALLERY · Rainan's ink";
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
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

function scrollToCategory(name: string) {
  const element = document.getElementById(name);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
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

// 扫描 src/assets/gallery 目录下的所有图片
const imageModules = import.meta.glob("../assets/gallery/**/*.{jpg,jpeg,png,gif,svg,webp}", {
  eager: true,
  import: "default",
});

// 按文件夹分组（支持二级分类）
const categories = computed(() => {
  const groupMap = new Map<string, Map<string, string[]>>();

  for (const path of Object.keys(imageModules)) {
    // 路径格式: ../assets/gallery/摄影/素材/xxx.jpg
    const parts = path.split("/").filter(Boolean);
    // parts: ["..", "assets", "gallery", "摄影", "素材", "xxx.jpg"]

    if (parts.length >= 5) {
      const mainFolder = parts[3]; // 主分类

      if (parts.length >= 6) {
        // 有子文件夹: ../assets/gallery/摄影/素材/xxx.jpg
        const subFolder = parts[4];
        if (!groupMap.has(mainFolder)) {
          groupMap.set(mainFolder, new Map());
        }
        const subMap = groupMap.get(mainFolder)!;
        if (!subMap.has(subFolder)) {
          subMap.set(subFolder, []);
        }
        subMap.get(subFolder)!.push(path);
      } else {
        // 没有子文件夹: ../assets/gallery/绘画/xxx.jpg
        if (!groupMap.has(mainFolder)) {
          groupMap.set(mainFolder, new Map());
        }
        const subMap = groupMap.get(mainFolder)!;
        if (!subMap.has("")) {
          subMap.set("", []);
        }
        subMap.get("")!.push(path);
      }
    }
  }

  return Array.from(groupMap.entries()).map(([name, subMap]) => ({
    name,
    subcategories: Array.from(subMap.entries()).map(([subName, images]) => ({
      name: subName,
      images,
    })),
  }));
});
</script>

<template>
  <CursorTrail />
  <div class="gallery">
    <header class="gallery-header">
      <h1>GALLERY</h1>
      <p>A collection of my works and moments</p>
    </header>

    <div class="gallery-sections" v-if="categories.length > 0">
      <!-- 顶部分类导航 -->
      <nav class="category-nav">
        <a
          v-for="category in categories"
          :key="category.name"
          :href="`#${category.name}`"
          class="nav-item"
          @click.prevent="scrollToCategory(category.name)"
        >
          {{ category.name }}
        </a>
      </nav>

      <section v-for="category in categories" :key="category.name" class="gallery-section">
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

    <div v-else class="empty-state">
      <p>No photos yet. Add images to src/assets/gallery/[folder]/</p>
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
  gap: 32px;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.nav-item {
  font-size: 1.3rem;
  font-weight: 700;
  color: #262628;
  text-decoration: none;
  position: relative;
  transition: color 0.2s;
}

.nav-item::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: #1a73e8;
  transition: width 0.2s ease;
}

.nav-item:hover {
  color: #1a73e8;
}

.nav-item:hover::after {
  width: 100%;
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
