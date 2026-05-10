# AI HANDOFF — 液态像素工作室 作品集网站

> **阅读优先级**: 本章节为「必须读完再动手」，以最小篇幅传递最多关键信息。

---

## 一句话概述

Next.js 16 单页作品集网站，静态导出到 GitHub Pages，自定义域名 `renxuanqi.top`。所有内容集中在一个 `"use client"` 组件文件中。

---

## 技术栈速览

- Next.js 16.2 (App Router) — **`output: 'export'` 静态模式**
- React 19.2 + TypeScript 5
- Tailwind CSS 4（`@import "tailwindcss"`，无 `tailwind.config.ts`）
- Framer Motion 12（客户端动效）
- lucide-react（图标）

---

## 核心文件地图

| 文件 | 作用 | 重要性 |
|------|------|--------|
| `src/app/page.tsx` | **所有页面内容**（7个 section、数据数组、组件定义） | 🔴 最高 |
| `src/app/layout.tsx` | 根布局、SEO metadata、字体加载 | 🟡 中 |
| `src/app/globals.css` | 全局样式、自定义工具类、移动端降级覆盖 | 🟡 中 |
| `next.config.ts` | `output: 'export'` + `images.unoptimized: true` | 🟡 中 |
| `public/CNAME` | 自定义域名绑定（`renxuanqi.top`） | 🟢 低 |
| `.github/workflows/deploy.yml` | GitHub Actions 自动构建部署 | 🟢 低 |

---

## 架构约定

### 组件模式
- `page.tsx` 是 `"use client"` 客户端组件（单文件，无拆分）
- 内部定义了两个可复用组件：`CursorGlow`（鼠标高光）和 `TiltWrapper`（3D 悬浮卡片包装器）
- `TiltWrapper` 仅在 `(hover: hover) and (pointer: fine)` 时启用 3D 透视
- 所有内容数据以内联数组形式直接写在 `page.tsx` 中，无外部数据源

### 页面 Section 顺序
```
Hero → #services → #works → #awards → #research → #team → #contact
```
每个 section 有 `id` 属性，顶部导航通过 `#hash` 锚点跳转。

### 图片约定
- 所有图片放在 `public/images/` 下
- 引用路径为 `/images/xxx.ext`（根路径，无 basePath）
- 使用 `next/image` 的 `<Image fill className="object-cover" />` 模式
- `images.unoptimized: true`（因 GitHub Pages 不支持 Next.js 图片优化）

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
**注意**: 以后添加任何使用 `translateZ`、`mix-blend-*` 的效果时，务必在触摸设备禁用。

### 2. PDF 导出
- `export_pdf_final.js` 依赖线上 URL（`https://renxuanqi.top`）
- 需要在滚动触发 Framer Motion 动画后等待图片全部加载，再强设 `opacity: 1`
- `backdrop-filter` 在 Chrome headless PDF 打印中会导致元素消失 → 打印 CSS 中已禁用
- 气泡（关键词 pills）在打印模式下需额外注入 CSS 覆盖 `opacity` 和 `transform`

### 3. 静态导出限制
- `output: 'export'` 模式下不支持 ISR/SSR/API Routes/Middleware
- 不支持 `next/image` 的优化功能（已设 `unoptimized: true`）
- 所有数据必须在构建时可用

### 4. Tailwind CSS 4
- 这是 **Tailwind v4**，不是 v3。配置方式完全不同：
  - **没有** `tailwind.config.ts` 文件
  - 使用 `@import "tailwindcss"` 在 CSS 中导入
  - 自定义主题通过 `@theme inline { }` 块
  - 自定义工具类通过 `@layer utilities { }`
  - 不要创建 `tailwind.config.ts`，不要使用 `tailwind.config.js` 的旧语法

### 5. 不要添加注释
项目约定：代码中**不添加任何注释**（除非用户明确要求）。

---

## 常用命令

```bash
npm run dev        # 启动开发服务器 → http://localhost:3000
npm run build      # 生产构建 → 输出到 ./out/
npm run lint       # ESLint 检查

node compress_images.js    # 批量压缩 public/images/ 下图片
node export_pdf_final.js   # 导出 PDF 到桌面 RXQ WEB 文件夹
node export_word.js        # 导出 Word 到桌面 RXQ WEB 文件夹
```

---

## 部署流程

```
git add . → git commit -m "xxx" → git push origin main
```
推送后 GitHub Actions 自动构建部署（`.github/workflows/deploy.yml`）。

**注意**: 如果 git push 超时，需要配置代理：
```bash
git config --global http.proxy http://127.0.0.1:7897
```

---

## 文案与定位

- 面向甲方/客户的商业作品集网站
- 文案风格：**朴实、客观、简洁**。避免夸张词汇
- 团队称呼：通用表述（"项目合作者"、"团队成员"），不固定人名组合
- 设计：极简深色背景，内容优先，响应式布局

---

## 已知需要关注的点

1. 新图片上传后，应先运行 `node compress_images.js` 压缩
2. 修改 `page.tsx` 中的文字后，PDF/Word 导出不会自动更新 — 需要重新运行对应脚本
3. GitHub Pages 部署有缓存延迟（通常 1-3 分钟），刷新时可能需要硬刷新（Ctrl+Shift+R）
