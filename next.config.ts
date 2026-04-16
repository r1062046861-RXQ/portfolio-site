/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // 对于 GitHub Pages 的特殊处理：
  // basePath 确保所有的路由跳转和静态资源前缀带上仓库名
  basePath: '/portfolio-site',
  // assetPrefix 在有些情况下会和 basePath 冲突，但为了保险起见，显式声明静态资源的来源
  assetPrefix: '/portfolio-site/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
