import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { buildPostSlug } from "./src/lib/slug.ts";
import { loadQqMusicReport } from "./api/qq-music.ts";

const IMG_DIR = "03 - resources/小小储物袋/Picture";
const SITE_URL = (process.env.VITE_SITE_URL || "").replace(/\/$/, "");

function collectPosts(): { slug: string; title: string; date: string; excerpt: string }[] {
  const postsDir = path.join(process.cwd(), "posts");
  const result: { slug: string; title: string; date: string; excerpt: string }[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === ".obsidian") continue;
        walk(full);
      } else if (entry.name.endsWith(".md")) {
        const slug = buildPostSlug(path.relative(postsDir, full).replace(/\\/g, "/"));
        const { data, content } = matter(fs.readFileSync(full, "utf-8"));
        const excerpt = content
          .replace(/```[\s\S]*?```/g, " ")
          .replace(/!?\[[^\]]*\]\([^)]*\)/g, " ")
          .replace(/[#>*`|~]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 200);
        result.push({
          slug,
          title: data.title || slug.split("/").pop() || slug,
          date: data.date ? new Date(data.date).toISOString() : fs.statSync(full).mtime.toISOString(),
          excerpt,
        });
      }
    }
  }
  walk(postsDir);
  return result.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildRssXml(posts: { slug: string; title: string; date: string; excerpt: string }[]): string {
  const items = posts.slice(0, 20)
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${SITE_URL}/blog/${encodeURI(p.slug)}</link>
      <guid>${SITE_URL}/blog/${encodeURI(p.slug)}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escapeXml(p.excerpt)}</description>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Rainan's ink</title>
    <link>${SITE_URL}</link>
    <description>Recording the bits and pieces of life</description>
    <language>zh-CN</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

function buildSitemapXml(posts: { slug: string; date: string }[]): string {
  const staticPaths = ["/", "/blog", "/gallery", "/about"];
  const entries = [
    ...staticPaths.map((p) => ({ loc: p, lastmod: "" })),
    ...posts.map((p) => ({ loc: `/blog/${encodeURI(p.slug)}`, lastmod: p.date.split("T")[0] })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) =>
      `  <url>\n    <loc>${SITE_URL}${e.loc}</loc>${
        e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ""
      }\n  </url>`
  )
  .join("\n")}
</urlset>`;
}

function buildRobotsTxt(): string {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

// 扫描 public/gallery 目录，自动生成 gallery 数据
function scanGalleryData(): { name: string; subcategories: { name: string; images: string[] }[] }[] {
  const galleryDir = path.join(process.cwd(), "public", "gallery");
  if (!fs.existsSync(galleryDir)) return [];

  const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp"]);

  function isImageFile(file: string): boolean {
    return IMAGE_EXTS.has(path.extname(file).toLowerCase());
  }

  const result: { name: string; subcategories: { name: string; images: string[] }[] }[] = [];

  for (const categoryEntry of fs.readdirSync(galleryDir, { withFileTypes: true })) {
    if (!categoryEntry.isDirectory()) continue;
    if (categoryEntry.name.startsWith(".")) continue;

    const categoryPath = path.join(galleryDir, categoryEntry.name);
    const category: { name: string; subcategories: { name: string; images: string[] }[] } = {
      name: categoryEntry.name,
      subcategories: [],
    };

    // 根目录的图片作为 name="" 的子分类
    const rootImages = fs.readdirSync(categoryPath)
      .filter((f) => fs.statSync(path.join(categoryPath, f)).isFile() && isImageFile(f))
      .sort();
    if (rootImages.length > 0) {
      category.subcategories.push({
        name: "",
        images: rootImages.map((f) => `/gallery/${categoryEntry.name}/${f}`),
      });
    }

    // 子目录
    for (const subEntry of fs.readdirSync(categoryPath, { withFileTypes: true })) {
      if (!subEntry.isDirectory()) continue;
      if (subEntry.name.startsWith(".")) continue;

      const subPath = path.join(categoryPath, subEntry.name);
      const images = fs.readdirSync(subPath)
        .filter((f) => fs.statSync(path.join(subPath, f)).isFile() && isImageFile(f))
        .sort();

      if (images.length > 0) {
        category.subcategories.push({
          name: subEntry.name,
          images: images.map((f) => `/gallery/${categoryEntry.name}/${subEntry.name}/${f}`),
        });
      }
    }

    if (category.subcategories.length > 0) {
      result.push(category);
    }
  }

  return result;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const qqMusicKey = env.QQMUSIC_API_KEY || process.env.QQMUSIC_API_KEY || "";

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
        name: "qq-music-dev-api",
        configureServer(server) {
          server.middlewares.use("/api/qq-music", async (_req, res) => {
            const data = await loadQqMusicReport(qqMusicKey);
            if (!data) {
              res.statusCode = 204;
              res.end();
              return;
            }
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify(data));
          });
        },
      },
      {
        name: "md-create-times",
      resolveId(id) {
        if (id === "virtual:md-create-times") return "\0" + id;
      },
      load(id) {
        if (id === "\0virtual:md-create-times") {
          const postsDir = path.join(process.cwd(), "posts");
          const map: Record<string, string> = {};
          function walk(dir: string) {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
              const full = path.join(dir, entry.name);
              if (entry.isDirectory()) {
                if (entry.name === ".obsidian") continue;
                walk(full);
              } else if (entry.name.endsWith(".md")) {
                const rel = "/" + path.relative(postsDir, full).replace(/\\/g, "/");
                map[rel] = fs.statSync(full).mtime.toISOString().split("T")[0];
              }
            }
          }
          walk(postsDir);
          return `export default ${JSON.stringify(map)}`;
        }
      },
    },
    {
      name: "serve-posts-images",
      configureServer(server) {
        server.middlewares.use("/images", (req, res, next) => {
          const decodedUrl = decodeURIComponent(req.url || "");
          const filePath = path.join(process.cwd(), "posts", IMG_DIR, decodedUrl);
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
        const srcDir = path.join(process.cwd(), "posts", IMG_DIR);
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
        if (SITE_URL) {
          const posts = collectPosts();
          fs.writeFileSync(path.join(process.cwd(), "dist", "rss.xml"), buildRssXml(posts));
          fs.writeFileSync(path.join(process.cwd(), "dist", "sitemap.xml"), buildSitemapXml(posts));
          fs.writeFileSync(path.join(process.cwd(), "dist", "robots.txt"), buildRobotsTxt());
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
  define: {
    global: "globalThis",
  },
  };
});
