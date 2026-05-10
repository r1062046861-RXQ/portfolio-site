# AI HANDOFF — 液态像素工作室 作品集网站

> **阅读优先级**: 本章节为「必须读完再动手」，以最小篇幅传递最多关键信息。

---

## 一句话概述

Next.js 16 单页作品集网站，静态导出到 GitHub Pages，自定义域名 `renxuanqi.top`，通过 Cloudflare CDN 加速。所有内容集中在一个 `"use client"` 组件文件中。

---

## 技术栈速览

- Next.js 16.2 (App Router) — **`output: 'export'` 静态模式**
- React 19.2 + TypeScript 5
- Tailwind CSS 4（`@import "tailwindcss"`，无 `tailwind.config.ts`）
- Framer Motion 12（客户端动效）
- lucide-react（图标）

---

## 基础设施

| 服务 | 用途 |
|------|------|
| GitHub Pages | 托管静态文件 |
| Cloudflare | DNS + CDN 加速 |
| 腾讯云 | 域名注册商（Nameserver 指向 Cloudflare） |

**DNS 记录（Cloudflare 侧）**:
```
CNAME  renxuanqi.top  r1062046861-RXQ.github.io  (已代理)
CNAME  www            r1062046861-RXQ.github.io  (已代理)
CNAME  test1           r1062046861-RXQ.github.io  (已代理)
```
**不要用 A 记录指向 GitHub Pages 固定 IP**，会导致间歇性打不开。

---

## 核心文件地图

| 文件 | 作用 | 重要性 |
|------|------|--------|
| `src/app/page.tsx` | **所有页面内容**（7个 section、数据数组、3个组件定义） | 🔴 最高 |
| `src/app/layout.tsx` | 根布局、SEO metadata、字体加载 | 🟡 中 |
| `src/app/globals.css` | 全局样式、自定义工具类、移动端降级覆盖 | 🟡 中 |
| `next.config.ts` | `output: 'export'` + `images.unoptimized: true` | 🟡 中 |
| `public/CNAME` | 自定义域名绑定（`renxuanqi.top`） | 🟢 低 |
| `.github/workflows/deploy.yml` | GitHub Actions 自动构建部署 | 🟢 低 |

---

## 架构约定

### 组件模式
- `page.tsx` 是 `"use client"` 客户端组件（单文件，无拆分）
- 内部定义了三个组件：`LoadProgress`（加载进度条）、`CursorGlow`（鼠标高光）、`TiltWrapper`（3D 悬浮卡片包装器）
- `LoadProgress`：页面顶部渐变进度条，显示下载速度和已加载/预估大小，通过 `responseEnd` 判断资源是否完成（支持缓存场景），10 秒安全超时自动消失
- `TiltWrapper` 仅在 `(hover: hover) and (pointer: fine)` 时启用 3D 透视
- 所有内容数据以内联数组形式直接写在 `page.tsx` 中，无外部数据源

### 页面 Section 顺序
```
Hero → #services → #works → #awards → #research → #team → #contact
```
每个 section 有 `id` 属性，顶部导航通过 `#hash` 锚点跳转。

### 图片约定
- 所有图片放在 `public/images/` 下，**全部为 WebP 格式，单张 ≤200KB**
- 引用路径为 `/images/xxx.webp`（根路径，无 basePath）
- 使用 `next/image` 的 `<Image fill className="object-cover" />` 模式
- `images.unoptimized: true`（因 GitHub Pages 不支持 Next.js 图片优化）
- 二维码图片使用 `priority` 预加载

---

## 关键陷阱 / Gotchas

### 1. 移动端渲染崩溃
**现象**: 少数 iPhone 12 / 华为手机页面黑屏或元素错乱
**原因**: iOS WebKit 对 `preserve-3d` + `mix-blend-mode` 组合存在渲染 Bug
**处理**: `globals.css` 中已写入：
```css
@media (hover: none), (pointer: coarse) {
  [style*="translateZ("] { transform: none !important; }
  .mix-blend-difference, .mix-blend-screen, .mix-blend-overlay {
    mix-blend-mode: normal !important;
  }
}
```

### 2. 加载进度条缓存 Bug
**现象**: 有缓存时进度条显示 "1KB/3.5MB" 不消失
**原因**: 缓存资源 `transferSize=0`，字节计数永远达不到预估值
**处理**: 进度百分比改用 `loadedResources/totalResources`（通过 `responseEnd > 0` 判断），而非字节数。另有 `window.load` 事件和 10 秒安全超时兜底。

### 3. PDF/Word 导出
- 导出脚本在项目根目录，依赖线上 URL（`https://renxuanqi.top`）
- 需要在滚动触发 Framer Motion 动画后等待图片全部加载
- `backdrop-filter` 在 Chrome headless PDF 打印中会导致元素消失 → 打印 CSS 中已禁用

### 4. 静态导出限制
- `output: 'export'` 模式下不支持 ISR/SSR/API Routes/Middleware
- 不支持 `next/image` 的优化功能（已设 `unoptimized: true`）

### 5. Tailwind CSS 4
- **没有** `tailwind.config.ts` 文件
- 使用 `@import "tailwindcss"` 在 CSS 中导入
- 自定义主题通过 `@theme inline { }` 块

### 6. 不要添加注释
项目约定：代码中**不添加任何注释**（除非用户明确要求）。

---

## 常用命令

```bash
npm run dev        # 启动开发服务器 → http://localhost:3000
npm run build      # 生产构建 → 输出到 ./out/
npm run lint       # ESLint 检查

node export_pdf_final.js   # 导出 PDF 到桌面 RXQ WEB 文件夹
node export_word.js        # 导出 Word 到桌面 RXQ WEB 文件夹
```

---

## 部署流程

```
git add . → git commit -m "xxx" → git push origin main
```
推送后 GitHub Actions 自动构建部署（`.github/workflows/deploy.yml`）。

如果 git push 超时：`git config --global http.proxy http://127.0.0.1:7897`

---

## 文案与定位

- 面向甲方/客户的商业作品集网站
- 文案风格：**朴实、客观、简洁**。避免夸张词汇
- 团队称呼：通用表述，不固定人名组合
- 设计：极简深色背景，内容优先，响应式布局
