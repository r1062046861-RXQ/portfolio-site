/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // 对于绑定了自定义顶级域名的 GitHub Pages，不需要 basePath
  // 导出为 目录/index.html 结构，保证子路由在任意静态服务器（含本地 python http.server）可访问
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
