import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

export default defineConfig({
  plugins: [
    vue(),
    {
      name: "serve-posts-images",
      configureServer(server) {
        server.middlewares.use("/posts/images", (req, res, next) => {
          const decodedUrl = decodeURIComponent(req.url || "");
          const filePath = path.join(
            process.cwd(),
            "posts",
            "images",
            decodedUrl
          );
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
        const srcDir = path.join(process.cwd(), "posts", "images");
        const destDir = path.join(process.cwd(), "dist", "posts", "images");
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
