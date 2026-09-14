import type { Metadata } from "next";

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

      {/* 首屏 Hero */}
      <section className="site-section site-hero relative flex flex-col justify-center min-h-[70vh] px-4 sm:px-8 md:px-12 pt-24 overflow-hidden bg-black">
        {/* 与首页一致的 AIGC 光影 + 科技网格背景 */}
        <div data-print-hidden="true" className="absolute inset-0 z-0 bg-zinc-950 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-indigo-900/30 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-emerald-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: "2s" }}></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-60"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/80 to-zinc-950 z-0" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
          <p className="text-xs sm:text-sm font-mono tracking-[0.18em] text-zinc-400 mb-6">REN XUANQI · PORTFOLIO</p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] mb-6">
            任玄奇作品集
          </h1>
          <p className="text-zinc-400 text-base md:text-lg max-w-2xl leading-relaxed">
            影像、新媒体与视觉创作实践，正在整理中，即将上线。
          </p>
        </div>
      </section>

      {/* 内容占位区：作品与展示形式确认后在此呈现 */}
      <section className="site-section py-20 md:py-28 px-4 sm:px-8 md:px-12 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-zinc-500 text-sm md:text-base leading-relaxed">
            作品内容与展示形式确认后，将在这里呈现完整的创作记录。
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer mt-auto py-6 text-center text-zinc-600 text-xs md:text-sm border-t border-zinc-900 bg-black">
        <p>© {new Date().getFullYear()} 液态像素艺术工作室 · 任玄奇作品集</p>
      </footer>
    </main>
  );
}
