import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { buildPostSlug } from "./src/lib/slug.ts";
import { stripMarkdown } from "./src/lib/text.ts";
import { getQqMusicPayload } from "./api/qq-music.ts";
import { getCodetimePayload } from "./api/codetime.ts";

const IMG_DIR = "03 - resources/小小储物袋/Picture";
const POSTS_DIR = "posts";

interface ScannedPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  /** 项目根相对路径，如 /posts/xxx.md —— 前端按它懒加载正文 */
  file: string;
  excerpt: string;
}

function normalizeTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  return raw ? [String(raw)] : [];
}

/**
 * 一次扫描 posts 目录，产出文章元数据。
 * 构建期就把 frontmatter 解析好：前端不再需要 gray-matter，也不再需要
 * 把全部 Markdown 正文打进首屏 chunk。
 */
function scanPosts(): ScannedPost[] {
  const postsRoot = path.join(process.cwd(), POSTS_DIR);
  const files: string[] = [];

  (function walk(dir: string) {
    const entries = fs
      .readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== ".obsidian") walk(full);
      } else if (entry.name.endsWith(".md")) {
        files.push(full);
      }
    }
  })(postsRoot);

  const usedSlugs = new Map<string, number>();

  const posts = files.map((full) => {
    const raw = fs.readFileSync(full, "utf-8");
    const { data, content } = matter(raw);
    const rel = path.relative(postsRoot, full).replace(/\\/g, "/");
    const tags = normalizeTags((data as { tags?: unknown }).tags);

    let slug = buildPostSlug(rel, tags);
    const seen = usedSlugs.get(slug);
    if (seen) {
      usedSlugs.set(slug, seen + 1);
      slug = `${slug}-${seen + 1}`;
    } else {
      usedSlugs.set(slug, 1);
    }

    const date = data.date
      ? data.date instanceof Date
        ? data.date.toISOString().split("T")[0]
        : String(data.date)
      : fs.statSync(full).mtime.toISOString().split("T")[0];

    return {
      slug,
      title: data.title || slug.split("/").pop() || slug,
      date,
      tags,
      file: `/${POSTS_DIR}/${rel}`,
      excerpt: stripMarkdown(content).slice(0, 200),
    };
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildRssXml(posts: ScannedPost[], siteUrl: string): string {
  const items = posts
    .slice(0, 20)
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${siteUrl}/blog/${encodeURI(p.slug)}</link>
      <guid>${siteUrl}/blog/${encodeURI(p.slug)}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escapeXml(p.excerpt)}</description>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Rainan's ink</title>
    <link>${siteUrl}</link>
    <description>Recording the bits and pieces of life</description>
    <language>zh-CN</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

function buildSitemapXml(posts: ScannedPost[], siteUrl: string): string {
  const staticPaths = ["/", "/blog", "/gallery", "/about"];
  const entries = [
    ...staticPaths.map((p) => ({ loc: p, lastmod: "" })),
    ...posts.map((p) => ({
      loc: `/blog/${encodeURI(p.slug)}`,
      lastmod: p.date.split("T")[0],
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) =>
      `  <url>\n    <loc>${siteUrl}${e.loc}</loc>${
        e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ""
      }\n  </url>`
  )
  .join("\n")}
</urlset>`;
}

function buildRobotsTxt(siteUrl: string): string {
  return `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
}

/** 扫描 public/gallery 目录，自动生成 gallery 数据 */
function scanGalleryData(): { name: string; subcategories: { name: string; images: string[] }[] }[] {
  const galleryDir = path.join(process.cwd(), "public", "gallery");
  if (!fs.existsSync(galleryDir)) return [];

  const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp"]);
  const isImageFile = (file: string) => IMAGE_EXTS.has(path.extname(file).toLowerCase());

  const result: { name: string; subcategories: { name: string; images: string[] }[] }[] = [];

  for (const categoryEntry of fs.readdirSync(galleryDir, { withFileTypes: true })) {
    if (!categoryEntry.isDirectory() || categoryEntry.name.startsWith(".")) continue;

    const categoryPath = path.join(galleryDir, categoryEntry.name);
    const category = { name: categoryEntry.name, subcategories: [] as { name: string; images: string[] }[] };

    // 根目录的图片作为 name="" 的子分类
    const rootImages = fs
      .readdirSync(categoryPath)
      .filter((f) => fs.statSync(path.join(categoryPath, f)).isFile() && isImageFile(f))
      .sort();
    if (rootImages.length > 0) {
      category.subcategories.push({
        name: "",
        images: rootImages.map((f) => `/gallery/${categoryEntry.name}/${f}`),
      });
    }

    for (const subEntry of fs.readdirSync(categoryPath, { withFileTypes: true })) {
      if (!subEntry.isDirectory() || subEntry.name.startsWith(".")) continue;

      const subPath = path.join(categoryPath, subEntry.name);
      const images = fs
        .readdirSync(subPath)
        .filter((f) => fs.statSync(path.join(subPath, f)).isFile() && isImageFile(f))
        .sort();

      if (images.length > 0) {
        category.subcategories.push({
          name: subEntry.name,
          images: images.map((f) => `/gallery/${categoryEntry.name}/${subEntry.name}/${f}`),
        });
      }
    }

    if (category.subcategories.length > 0) result.push(category);
  }

  return result;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const qqMusicKey = env.QQMUSIC_API_KEY || process.env.QQMUSIC_API_KEY || "";
  const siteUrl = (env.VITE_SITE_URL || process.env.VITE_SITE_URL || "").replace(/\/$/, "");

  return {
    plugins: [
      vue(),
      {
        name: "virtual-gallery-data",
        resolveId(id) {
          if (id === "virtual:gallery-data") return "\0" + id;
        },
        load(id) {
          if (id === "\0virtual:gallery-data") {
            return `export default ${JSON.stringify(scanGalleryData())}`;
          }
        },
      },
      {
        name: "virtual-post-meta",
        resolveId(id) {
          if (id === "virtual:post-meta") return "\0" + id;
        },
        load(id) {
          if (id === "\0virtual:post-meta") {
            const meta = scanPosts().map(({ excerpt: _excerpt, ...rest }) => rest);
            return `export default ${JSON.stringify(meta)}`;
          }
        },
        configureServer(server) {
          // 改 Markdown 后让虚拟模块失效并整页刷新，避免 dev 时看到旧标题/旧日期
          server.watcher.add(path.join(process.cwd(), POSTS_DIR));
          server.watcher.on("change", (file) => {
            if (!file.endsWith(".md")) return;
            const mod = server.moduleGraph.getModuleById("\0virtual:post-meta");
            if (mod) server.moduleGraph.invalidateModule(mod);
            server.ws.send({ type: "full-reload" });
          });
        },
      },
      {
        name: "qq-music-dev-api",
        configureServer(server) {
          server.middlewares.use("/api/qq-music", async (_req, res) => {
            // maxAgeMs = 0：开发时每次都触发一次后台刷新，但请求本身立刻返回已有缓存，
            // 不会再出现「第一次请求卡在上游、页面空白」的情况
            const body = await getQqMusicPayload(qqMusicKey, 0);
            if (!body) {
              res.statusCode = 502;
              res.setHeader("Cache-Control", "no-store");
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: "qq-music unavailable" }));
              return;
            }
            res.statusCode = 200;
            res.setHeader("Cache-Control", "no-store");
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(body);
          });
        },
      },
      {
        name: "codetime-dev-api",
        configureServer(server) {
          // 开发时也走同一份代理逻辑：codetime.dev 没有 CORS 头，
          // 若不在 dev 里顶掉这个路径，请求会落到 SPA fallback 拿到 HTML，
          // 徽章就永远只显示 shields.io 兜底那张
          server.middlewares.use("/api/codetime", async (_req, res) => {
            const body = await getCodetimePayload();
            if (!body) {
              res.statusCode = 502;
              res.setHeader("Cache-Control", "no-store");
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: "codetime unavailable" }));
              return;
            }
            res.statusCode = 200;
            res.setHeader("Cache-Control", "no-store");
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(body);
          });
        },
      },
      {
        name: "serve-posts-images",
        configureServer(server) {
          server.middlewares.use("/images", (req, res, next) => {
            const decodedUrl = decodeURIComponent(req.url || "");
            const filePath = path.join(process.cwd(), POSTS_DIR, IMG_DIR, decodedUrl);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeMap: Record<string, string> = {
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".gif": "image/gif",
                ".svg": "image/svg+xml",
                ".webp": "image/webp",
              };
              res.setHeader("Content-Type", mimeMap[ext] || "application/octet-stream");
              res.setHeader("Cache-Control", "max-age=3600");
              res.end(fs.readFileSync(filePath));
            } else {
              next();
            }
          });
        },
        closeBundle() {
          const srcDir = path.join(process.cwd(), POSTS_DIR, IMG_DIR);
          const destDir = path.join(process.cwd(), "dist", "images");
          if (fs.existsSync(srcDir)) {
            fs.mkdirSync(destDir, { recursive: true });
            for (const file of fs.readdirSync(srcDir)) {
              const srcFile = path.join(srcDir, file);
              if (fs.statSync(srcFile).isFile()) {
                fs.copyFileSync(srcFile, path.join(destDir, file));
              }
            }
          }
          if (siteUrl) {
            const posts = scanPosts();
            fs.writeFileSync(path.join(process.cwd(), "dist", "rss.xml"), buildRssXml(posts, siteUrl));
            fs.writeFileSync(path.join(process.cwd(), "dist", "sitemap.xml"), buildSitemapXml(posts, siteUrl));
            fs.writeFileSync(path.join(process.cwd(), "dist", "robots.txt"), buildRobotsTxt(siteUrl));
          }
        },
      },
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        buffer: "buffer/",
      },
    },
    server: {
      // 后台 API 走本地 Go 服务；/api/qq-music、/api/codetime 由上面的插件中间件优先处理
      proxy: {
        "/api": {
          target: "http://127.0.0.1:8080",
          changeOrigin: true,
        },
        "/uploads": {
          target: "http://127.0.0.1:8080",
          changeOrigin: true,
        },
      },
    },
    define: {
      global: "globalThis",
    },
  };
});
