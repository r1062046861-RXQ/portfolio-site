/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/portfolio-site',
  assetPrefix: '/portfolio-site/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
