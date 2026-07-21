import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const IMG_DIR = "03 - resources/小小储物袋/Picture";

export default defineConfig({
  plugins: [
    vue(),
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
});
