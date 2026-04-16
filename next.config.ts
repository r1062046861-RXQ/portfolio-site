/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // 对于 GitHub Pages，由于使用了 next/image 的 unoptimized，且通过 basePath 设置了根路径
  // 不再使用 assetPrefix，避免在某些加载场景下路径被双重叠加导致 404
  basePath: '/portfolio-site',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
