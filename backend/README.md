# VisaBlog Backend

Go 编写的单用户后台服务，为前端 `/admin` 页面提供：

- 登录（bcrypt + JWT，HttpOnly Cookie）
- 笔记分类树（目录层级）与 Markdown 笔记 CRUD
- 图片分类树、多图上传、删除、静态访问
- 文件系统即存储，不依赖数据库

## 运行

需要 Go 1.26+。

```bash
cd backend
cp .env.example .env      # 修改账号密码与 SESSION_SECRET
go run ./cmd/server       # 监听 :8080
```

前端另开一个终端：

```bash
cd fronted
npm run dev               # http://localhost:5173/admin
```

Vite 已把 `/api` 代理到 `http://localhost:8080`。

## 目录约定

| 内容 | 默认目录 | 说明 |
| --- | --- | --- |
| 笔记 | `../fronted/posts/<分类路径>/<slug>.md` | 直接进入站点内容目录，构建时自动收录 |
| 图片 | `../fronted/public/uploads/<分类路径>/` | 开发时由 Vite 直接服务，构建时复制到 `dist/uploads` |

分类就是目录层级，任意深度。

## API 一览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/admin/login` | `{username,password}` |
| POST | `/api/admin/logout` | 退出 |
| GET | `/api/admin/me` | 当前登录用户 |
| GET | `/api/admin/tree?kind=notes\|images` | 分类树 |
| POST | `/api/admin/categories` | `{kind,parent,name}` |
| PATCH | `/api/admin/categories` | `{kind,path,name}` |
| DELETE | `/api/admin/categories?kind=&path=` | 仅空目录可删 |
| GET | `/api/admin/notes?category=` | 笔记列表 |
| GET | `/api/admin/note?path=` | 笔记详情 |
| POST | `/api/admin/notes` | 新建笔记 |
| PUT | `/api/admin/note?path=` | 更新笔记 |
| DELETE | `/api/admin/note?path=` | 删除笔记 |
| GET | `/api/admin/images?category=` | 图片列表 |
| POST | `/api/admin/images?category=` | multipart `files` 多图上传 |
| DELETE | `/api/admin/image?path=` | 删除图片 |
| POST | `/api/feedback` | 公开接口，提交意见反馈 |
| GET | `/api/admin/feedback` | 意见列表 |
| DELETE | `/api/admin/feedback?id=` | 删除意见 |

## 测试期免登录

开发/演示阶段可以在 `.env` 里设置：

```
AUTH_DISABLED=true
```

此时所有 `/api/admin/*` 接口跳过 JWT 校验，后台直接进入（页面会显示「测试模式」。**上线前务必改回 `false`。**

## 意见反馈

- 前台页面：`/feedback`，无需登录即可提交
- 后台「意见」页：查看/删除
- 存储：`FEEDBACK_DIR`（默认 `backend/data/feedback/*.json`）
- 同一 IP 10 秒内只能提交一次

## 生产部署提醒

原型默认直接写前端目录，适合「后端与前端在同一台机器/同一份 checkout」的部署方式。
如果后端要独立部署，请把 `NOTES_DIR` / `IMAGES_DIR` 指向持久化目录，并另行处理发布构建与反向代理。
