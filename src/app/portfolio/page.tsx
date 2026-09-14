import type { Metadata } from "next";
import PortfolioExperience from "./PortfolioExperience";

export const metadata: Metadata = {
  title: "任玄奇作品集 | 液态像素艺术工作室",
  description: "任玄奇的影像、新媒体与视觉创作作品集。",
};

export default function Portfolio() {
  return (
    <main className="site-shell flex flex-col min-h-screen bg-black text-white">
      {/* 导航栏 */}
      <nav className="site-nav fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 mix-blend-difference text-white">
        <a href="/" className="shrink-0 font-bold text-sm sm:text-lg tracking-tight whitespace-nowrap">
          液态像素艺术工作室
        </a>
        <a href="/" className="border border-white/30 px-4 py-2 rounded-md text-sm hover:bg-white hover:text-black transition-colors">
          返回首页
        </a>
      </nav>

      {/* 3D 交互体验（支持设备）/ 静态列表（降级与打印） */}
      <PortfolioExperience />
    </main>
  );
}
