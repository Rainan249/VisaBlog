# Rainan's ink

个人博客站点：Vue 3 + TypeScript + Vite，内容直接来自 Obsidian 笔记库（`posts/`）。

## 快速开始

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 类型检查 + 生产构建到 dist/
npm run preview    # 本地预览构建产物
npm run typecheck  # 只跑 vue-tsc
```

## 后台管理（/admin）

管理页由 `src/views/Admin.vue` 提供，数据来自同仓库的 Go 后端（`../backend`）：

- 登录：单用户，bcrypt + JWT HttpOnly Cookie
- 笔记：分类树 + Markdown 编辑/预览，直接写入 `posts/`
- 图片：分类树 + 多图上传，写入 `public/uploads/`

本地开发时 Vite 已把 `/api`、`/uploads` 代理到 `http://127.0.0.1:8080`。
若前后端分开部署，设置 `VITE_API_BASE` 指向后端地址。

环境变量（复制 `.env.example` 为 `.env`）：

| 变量 | 说明 |
| --- | --- |
| `VITE_SITE_URL` | 线上域名。配置后构建时才会生成 `rss.xml` / `sitemap.xml` / `robots.txt` |
| `VITE_WALINE_SERVER` | Waline 评论服务地址；不配则不显示评论区 |
| `QQMUSIC_API_KEY` | QQ 音乐听歌报告接口密钥；不配则关于页显示「暂未取到」 |

## 目录结构

```
src/
├─ views/        页面：Home / Blog / Post / Gallery / Tag / About / NotFound
├─ components/   通用组件：导航、时间轴、目录树、光标特效等
├─ lib/          纯逻辑：文章元数据、Markdown 渲染、主题、文本工具
├─ router/       路由（按页懒加载）
└─ style.css     全局设计变量与 Markdown 样式
posts/           Obsidian 笔记（Markdown + 附件）
public/gallery/  相册图片，构建时自动扫描
api/             Vercel Serverless 函数：QQ 音乐 / CodeTime 代理
```

## 内容约定

- `posts/` 下任意层级的 `.md` 都会被收录，`.obsidian/` 自动忽略。
- frontmatter 支持 `title`、`date`、`tags`；`tags[0]` 同时作为文章 URL 的分类前缀。
- 文件名里的 `001-030.`、`1.` 这类编号会自动从 URL 中去除。
- 图片用 Obsidian 的 `![[xxx.png]]` 写法即可，构建时会映射到 `/images/`。

## 实现要点

- **文章元数据在构建期解析**（`vite.config.ts` 的 `virtual:post-meta`），正文按需分块加载，首页不会下载全部笔记。
- **路由级代码分割**：每个页面单独打包。
- **Markdown**：`marked` + 自定义渲染器，支持 Obsidian Callout、GitHub 仓库卡片、代码块复制、链接预览、KaTeX。
- **代码高亮**：`highlight.js` 只注册文章里实际用到的语言（见 `src/lib/highlight.ts`）。

## 部署

推送到 `main` 后由 Vercel 构建；`vercel.json` 已配置 `/api/*` 函数与 SPA rewrite。
