# 液态像素工作室 · 作品集网站

基于 Next.js 构建的单页面作品集/履历网站，面向甲方与客户展示团队的项目履历、学术成果和核心服务。

**线上地址**: [renxuanqi.top](https://renxuanqi.top)

---

## 技术栈

| 类型 | 技术 |
|------|------|
| 框架 | Next.js 16.2 (App Router) |
| UI 库 | React 19.2 |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS 4 |
| 动效 | Framer Motion 12 |
| 图标 | lucide-react |
| 字体 | Geist Sans / Geist Mono (next/font) |

---

## 项目结构

```
portfolio-site/
├── src/app/
│   ├── page.tsx          # 主页面（所有内容集中在此单文件）
│   ├── layout.tsx        # 根布局（metadata、字体加载、html/body 壳）
│   ├── globals.css       # 全局样式、自定义工具类、移动端降级
│   └── favicon.ico
├── public/
│   ├── images/           # 所有图片资源（案例、学术、头像、二维码等）
│   └── CNAME             # 自定义域名（renxuanqi.top）
├── .github/workflows/
│   └── deploy.yml        # GitHub Pages 自动部署 CI/CD
├── next.config.ts        # Next.js 配置（静态导出）
├── postcss.config.mjs    # PostCSS（Tailwind CSS 4 插件）
├── tsconfig.json
├── eslint.config.mjs
│
├── export_pdf_final.js   # Puppeteer PDF 导出脚本
├── export_word.js        # Puppeteer + docx Word 导出脚本
├── compress_images.js    # sharp 图片批量压缩脚本
├── screenshot.js         # Puppeteer 全页长截图脚本
└── package.json
```

---

## 页面结构（单页滚动）

页面由 7 个 `<section>` 组成，导航锚点链接固定跳转：

1. **Hero** — 关键词气泡、团队简介、CTA 按钮
2. **核心服务** (`#services`) — 6 个 3D 悬浮卡片
3. **案例展示** (`#works`) — 10 个项目（5 列网格）
4. **展览与荣誉** (`#awards`) — 8 项展览记录
5. **学术成果** (`#research`) — 6 项学术成果（带背景图、悬停交互）
6. **团队成员** (`#team`) — 3 人（任玄奇、吴于枫、章斯敏）
7. **联系我们** (`#contact`) — 微信二维码 + 邮箱

---

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
# → http://localhost:3000

# 生产构建
npm run build
# 输出到 ./out 目录

# 代码检查
npm run lint
```

---

## 辅助脚本

| 脚本 | 用途 | 命令 |
|------|------|------|
| `export_pdf_final.js` | 导出按板块分页的 PDF（A3 横向/16:9，<3MB） | `node export_pdf_final.js` |
| `export_word.js` | 导出含序号层级的 DOCX 文件 | `node export_word.js` |
| `compress_images.js` | 压缩 `public/images/` 下所有图片至 <400KB | `node compress_images.js` |
| `screenshot.js` | 生成本地站点的全页长图 | `node screenshot.js` |

---

## 部署

**平台**: GitHub Pages（通过 GitHub Actions CI/CD）

**流程**:
1. 代码推送到 `main` 分支
2. GitHub Actions 自动运行 `npm ci` → `npm run build`
3. 将 `./out` 目录部署到 GitHub Pages

**关键配置**:
- `next.config.ts` 中 `output: 'export'`（静态导出模式）
- `images.unoptimized: true`（GitHub Pages 不支持 Next.js 图片优化）
- `public/CNAME` 文件绑定自定义域名 `renxuanqi.top`

---

## 注意事项

### 移动端兼容
- iOS Safari 和微信浏览器存在 `preserve-3d` / `mix-blend-mode` 渲染崩溃 Bug
- 已在 `globals.css` 中通过 `@media (hover: none), (pointer: coarse)` 降级处理
- 触摸设备自动禁用 3D 透视和混合模式效果

### 图片
- 所有图片路径为 `/images/xxx`（根路径，因自定义域名无需 basePath）
- 案例图片、学术成果图片需保持命名与 `page.tsx` 中的引用一致
- 新图片添加后建议运行 `node compress_images.js` 压缩

### Framer Motion
- `page.tsx` 标记为 `"use client"`（整个文件为客户端组件）
- 使用 `TiltWrapper` 组件实现卡片 3D 悬浮效果（仅桌面端）
- 关键词气泡使用 spring 动画逐词弹出
