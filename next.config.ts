/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // 对于绑定了自定义顶级域名的 GitHub Pages，不需要 basePath
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
