# VisaBlog

个人博客：Vue 3 前端 + Go 后台服务。

```
VisaBlog/
├─ fronted/   Vue 3 + TypeScript + Vite 站点（含 /admin 管理页）
└─ backend/   Go 单用户后台：登录、笔记/图片分类树与上传
```

## 一键启动（推荐）

Windows 下双击 `scripts/dev.cmd`，或在 PowerShell 里：

```powershell
.\scripts\dev.ps1
```

脚本会自动：

1. 检查 Node.js
2. 检测 Go，没有则下载便携版到 `.tools/`（只下一次）
3. 首次运行时生成 `backend/.env`（随机后台密码）
4. 编译并启动 Go 后端、启动 Vite
5. 打开 `http://localhost:5173/admin`

其他参数：

```powershell
.\scripts\dev.ps1 -NoBrowser     # 不自动开浏览器
.\scripts\dev.ps1 -SmokeTest     # 启动→检查→自动停止（用于验证环境）
.\scripts\dev.ps1 -GoExe "C:\Program Files\Go\bin\go.exe"   # 指定 Go
```

日志在 `.run/`，按 `Ctrl+C` 会同时停止前后端。

## 手动启动

```bash
# 终端 1：后端
cd backend
cp .env.example .env          # 改账号密码
go run ./cmd/server           # http://localhost:8080

# 终端 2：前端
cd fronted
npm install
npm run dev                   # http://localhost:5173
```

- 站点：<http://localhost:5173/>
- 后台：<http://localhost:5173/admin>

Vite 会把 `/api` 与 `/uploads` 代理到 `http://127.0.0.1:8080`。

## 当前测试模式

`backend/.env` 里现在设了：

```
AUTH_DISABLED=true
```

后台 `/admin` 直接进入、不需要登录；前台 `/feedback` 可提交意见，后台「意见」页查看。上线前把 `AUTH_DISABLED` 改回 `false`。

> 修改 `backend/.env` 后必须重启后端才会生效（脚本里按 `Ctrl+C` 再重跑即可）。

## 内容如何存放

| 内容 | 位置 |
| --- | --- |
| 笔记 Markdown | `fronted/posts/<分类路径>/<文件名>.md` |
| 后台上传图片 | `fronted/public/uploads/<分类路径>/` |
| 相册图片 | `fronted/public/gallery/<大类>/<子类>/` |

分类层级就是目录层级，后台里可以直接新建/重命名/删除分类。

## 部署

- 前端仍按原有方式部署到 Vercel（`fronted`）。
- Go 后端需要独立运行在有持久磁盘的服务器上；把 `NOTES_DIR` / `IMAGES_DIR` 指向该服务器上的内容目录，并在前端设置 `VITE_API_BASE` 指向后端地址。
- 后台上传后如需更新线上静态站，需要重新构建前端（这是当前静态架构的约束，后续可改成构建钩子或运行时内容 API）。

详细说明见 [`fronted/README.md`](fronted/README.md) 和 [`backend/README.md`](backend/README.md)。
