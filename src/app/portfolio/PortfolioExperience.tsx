"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { works } from "./works";
import type { PortfolioScreen } from "./Scene3D";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

/** 静态降级版本：无 WebGL / 移动端 / 减弱动效 / 打印时使用 */
function StaticPortfolio({ hidden }: { hidden: boolean }) {
  return (
    <div className={hidden ? "portfolio-static--hidden" : undefined}>
      <section className="site-section site-hero relative flex flex-col justify-center min-h-[60vh] px-4 sm:px-8 md:px-12 pt-24 overflow-hidden bg-black">
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
            影像、新媒体与视觉创作实践。桌面浏览器中可体验 3D 交互版本。
          </p>
        </div>
      </section>

      <section className="site-section py-20 md:py-28 px-4 sm:px-8 md:px-12 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight mb-10">作品</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {works.map((w) => (
              <article key={w.id} className="site-card rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
                <div className="h-36 w-full" style={{ background: `linear-gradient(135deg, hsl(${w.hue} 55% 42%), hsl(${(w.hue + 40) % 360} 60% 24%))` }} />
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-1">{w.title}</h3>
                  <p className="text-zinc-500 text-sm font-mono mb-3">{w.year} · {w.medium}</p>
                  <p className="text-zinc-400 text-sm leading-relaxed">{w.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="site-section py-20 md:py-28 px-4 sm:px-8 md:px-12 bg-black border-t border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight mb-5">关于任玄奇</h2>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
            简介占位：任玄奇的创作方向、教育背景、展览与获奖经历将在这里呈现，正式文案确认后替换。
          </p>
        </div>
      </section>

      <footer className="site-footer py-6 text-center text-zinc-600 text-xs md:text-sm border-t border-zinc-900 bg-black">
        <p>© {new Date().getFullYear()} 液态像素艺术工作室 · 任玄奇作品集</p>
      </footer>
    </div>
  );
}

const SCREEN_LABEL: Record<PortfolioScreen, string> = {
  menu: "MENU · 主菜单",
  chapters: "CHAPTERS · 作品章节",
  detail: "ARCHIVE · 作品档案",
  about: "ABOUT · 关于",
};

const SCREEN_HINT: Record<PortfolioScreen, string> = {
  menu: "点击贴纸开始浏览",
  chapters: "↑↓ 切换作品 · 回车查看 · ESC 返回",
  detail: "ESC 返回章节列表",
  about: "ESC 返回主菜单",
};

export default function PortfolioExperience() {
  const [capable, setCapable] = useState(false);
  const [screen, setScreen] = useState<PortfolioScreen>("menu");
  const [index, setIndex] = useState(0);
  const [glitchKey, setGlitchKey] = useState(0);

  useEffect(() => {
    const ok = (() => {
      try {
        const c = document.createElement("canvas");
        if (!c.getContext("webgl2") && !c.getContext("webgl")) return false;
      } catch {
        return false;
      }
      if (window.matchMedia("(pointer: coarse)").matches) return false;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
      if (window.innerWidth < 768) return false;
      return true;
    })();
    setCapable(ok);
  }, []);

  const go = useCallback((s: PortfolioScreen) => {
    setScreen(s);
    setGlitchKey((k) => k + 1);
  }, []);

  const step = useCallback((d: number) => {
    setIndex((i) => (i + d + works.length) % works.length);
    setGlitchKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!capable) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (screen === "detail") go("chapters");
        else if (screen !== "menu") go("menu");
        return;
      }
      if (screen === "chapters") {
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          step(-1);
        } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          step(1);
        } else if (e.key === "Enter") {
          go("detail");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [capable, screen, go, step]);

  const work = works[index];

  return (
    <>
      {/* 静态内容始终存在于 DOM：无 JS / 不支持设备 / 打印时使用 */}
      <StaticPortfolio hidden={capable} />

      {capable && (
        <div className="portfolio-live fixed inset-0 z-40 overflow-hidden bg-black">
          {/* 氛围光 */}
          <div data-print-hidden="true" className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] bg-indigo-900/25 rounded-full blur-[140px] animate-pulse" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] bg-emerald-900/20 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: "1.6s" }} />
          </div>

          <Scene3D screen={screen} index={index} glitchKey={glitchKey} works={works} />

          {/* HUD */}
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between pt-16 pb-4 px-4 sm:px-6">
            <div className="flex justify-end">
              <div className="text-right font-mono text-[11px] tracking-[0.22em] text-zinc-500">
                <div className="text-zinc-200 text-xs">RXQ · MIXTAPE</div>
                <div>{SCREEN_LABEL[screen]}</div>
              </div>
            </div>
            <div className="flex items-end justify-between font-mono text-[11px] text-zinc-600">
              <div>液态像素艺术工作室 · 任玄奇作品集</div>
              <div className="text-zinc-500">{SCREEN_HINT[screen]}</div>
            </div>
          </div>

          {/* 主菜单：贴纸 */}
          {screen === "menu" && (
            <div className="absolute z-20 left-[7%] top-1/2 -translate-y-1/2 flex flex-col items-start gap-7">
              <button
                type="button"
                onClick={() => go("chapters")}
                className="sticker-star pointer-events-auto"
                aria-label="进入作品章节"
              >
                <span className="text-lg leading-snug">
                  进入
                  <br />
                  作品
                </span>
              </button>
              <button
                type="button"
                onClick={() => go("about")}
                className="sticker-card pointer-events-auto"
                aria-label="关于任玄奇"
              >
                <span className="sticker-card-title">关于任玄奇</span>
                <span className="sticker-card-sub">REN XUANQI</span>
                <span className="sticker-card-wave">～～～</span>
              </button>
              <a href="/" className="sticker-barcode pointer-events-auto" aria-label="返回工作室首页">
                <span className="sticker-barcode-bars" />
                <span className="sticker-barcode-label">返回首页 · EXIT</span>
              </a>
            </div>
          )}

          {/* 章节选择 */}
          {screen === "chapters" && (
            <div className="absolute z-20 left-[7%] top-1/2 -translate-y-1/2 max-w-md">
              <p className="font-mono text-[11px] tracking-[0.22em] text-zinc-500 mb-5">
                CHAPTERS · 作品章节
              </p>
              <div className="flex flex-col items-start gap-1 mb-5">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="pointer-events-auto text-zinc-400 hover:text-white transition-colors text-2xl leading-none px-1"
                  aria-label="上一个作品"
                >
                  ∧
                </button>
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                  {work.title}
                </h1>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="pointer-events-auto text-zinc-400 hover:text-white transition-colors text-2xl leading-none px-1"
                  aria-label="下一个作品"
                >
                  ∨
                </button>
              </div>
              <p className="text-zinc-400 text-sm mb-2">
                {work.year} · {work.medium}
              </p>
              <p className="font-mono text-xs text-zinc-600 mb-8">
                {String(index + 1).padStart(2, "0")} / {String(works.length).padStart(2, "0")}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => go("detail")}
                  className="pointer-events-auto bg-white text-black px-5 py-2.5 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors"
                >
                  ▶ 进入作品
                </button>
                <button
                  type="button"
                  onClick={() => go("menu")}
                  className="pointer-events-auto border border-white/30 px-5 py-2.5 rounded-md text-sm hover:bg-white hover:text-black transition-colors"
                >
                  ← 返回菜单
                </button>
              </div>
            </div>
          )}

          {/* 作品档案（盒背） */}
          {screen === "detail" && (
            <div className="absolute z-20 left-[6%] top-1/2 -translate-y-1/2 w-[min(30rem,44vw)]">
              <p className="font-mono text-[11px] tracking-[0.22em] text-zinc-500 mb-5">
                ARCHIVE · 作品档案
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">{work.title}</h1>
              <dl className="border-t border-zinc-800 divide-y divide-zinc-800/70 text-sm mb-6">
                <div className="flex justify-between py-3">
                  <dt className="text-zinc-500">年份</dt>
                  <dd className="text-zinc-200 font-mono">{work.year}</dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="text-zinc-500">媒介</dt>
                  <dd className="text-zinc-200">{work.medium}</dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="text-zinc-500">编号</dt>
                  <dd className="text-zinc-200 font-mono">{work.id.toUpperCase()}</dd>
                </div>
              </dl>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">{work.description}</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => go("chapters")}
                  className="pointer-events-auto bg-white text-black px-5 py-2.5 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors"
                >
                  ← 返回章节
                </button>
                <button
                  type="button"
                  onClick={() => go("menu")}
                  className="pointer-events-auto border border-white/30 px-5 py-2.5 rounded-md text-sm hover:bg-white hover:text-black transition-colors"
                >
                  菜单
                </button>
              </div>
            </div>
          )}

          {/* 关于 */}
          {screen === "about" && (
            <div className="absolute z-20 left-[6%] top-1/2 -translate-y-1/2 w-[min(30rem,44vw)]">
              <p className="font-mono text-[11px] tracking-[0.22em] text-zinc-500 mb-5">
                ABOUT · 关于
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">任玄奇</h1>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                简介占位：任玄奇的创作方向、教育背景、展览与获奖经历将在这里呈现，正式文案确认后替换。
              </p>
              <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                液态像素艺术工作室 · 企业团队与艺术家技术协作
              </p>
              <button
                type="button"
                onClick={() => go("menu")}
                className="pointer-events-auto border border-white/30 px-5 py-2.5 rounded-md text-sm hover:bg-white hover:text-black transition-colors"
              >
                ← 返回菜单
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
