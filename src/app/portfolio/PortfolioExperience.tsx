"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { works } from "./works";
import type { PortfolioMode, ScrollState } from "./Scene3D";

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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.image} alt={w.title} className="h-36 w-full object-cover" />
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
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-4">
            数字艺术创作者、青年学者，硕士毕业于天津美术学院跨媒体艺术专业。创作立足于视觉文化研究与技术思维的交叉，以
            AIGC、生成算法与扩展现实（XR）为主要工具，探索技术图像中的叙事结构与感知经验重构。
          </p>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-4">
            作品曾入选第十四届全国美展、中国数字艺术大展、首届青年影像艺术100展、CCF
            计算艺术大展、海南岛国际电影节等展览，并多次参与国家艺术基金人才培养项目及省市级科研项目。
          </p>
          <p className="text-zinc-500 text-sm font-mono">
            微信 r1062046861 · 邮箱 1062046861@qq.com
          </p>
        </div>
      </section>

      <footer className="site-footer py-6 text-center text-zinc-600 text-xs md:text-sm border-t border-zinc-900 bg-black">
        <p>© {new Date().getFullYear()} 液态像素艺术工作室 · 任玄奇作品集</p>
      </footer>
    </div>
  );
}

export default function PortfolioExperience() {
  const [capable, setCapable] = useState(false);
  const [mode, setMode] = useState<PortfolioMode>("journey");
  const [section, setSection] = useState(0);
  const [glitchKey, setGlitchKey] = useState(0);
  const scrollRef = useRef<ScrollState>({ p: 0, v: 0 });
  const liveRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef(0);

  const N = works.length + 2; // S0 菜单 + 每作品一屏 + 关于
  const ABOUT = N - 1;
  const activeWork = Math.min(Math.max(section - 1, 0), works.length - 1);

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

  const scrollToSection = useCallback(
    (i: number) => {
      const idx = Math.min(Math.max(i, 0), N - 1);
      window.scrollTo({ top: idx * window.innerHeight, behavior: "smooth" });
    },
    [N]
  );

  const savedScrollRef = useRef(0);
  const openDetail = useCallback(() => {
    savedScrollRef.current = window.scrollY;
    setMode("detail");
    setGlitchKey((k) => k + 1);
  }, []);
  const closeDetail = useCallback(() => {
    setMode("journey");
    setGlitchKey((k) => k + 1);
    // overflow 锁定期间浏览器可能钳制 scrollY，解锁后恢复章节位置
    setTimeout(() => {
      window.scrollTo({ top: savedScrollRef.current, behavior: "instant" });
    }, 30);
  }, []);

  /* 滚动驱动核心（Shopify Editions 的做法：滚动位置驱动渲染参数，而不是驱动 React 渲染）。
     这里用 rAF 把原生滚动平滑成「惯性滚动值」，同一份值喂给 WebGL 与 DOM 视差层。 */
  useEffect(() => {
    if (!capable) return;
    let raf = 0;
    let smooth = window.scrollY;
    let prev = smooth;
    let last = performance.now();

    type PxItem = { el: HTMLElement; f: number; center: number };
    let pxItems: PxItem[] = [];
    const docTop = (el: HTMLElement) => {
      let y = 0;
      let n: HTMLElement | null = el;
      while (n) {
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return y;
    };
    const measure = () => {
      const vh = window.innerHeight;
      pxItems = Array.from(
        liveRef.current?.querySelectorAll<HTMLElement>("[data-px]") ?? []
      ).map((el) => {
        const sec = (el.closest("section") as HTMLElement | null) ?? el;
        return {
          el,
          f: parseFloat(el.dataset.px || "0"),
          center: docTop(sec) + sec.offsetHeight / 2 - vh / 2,
        };
      });
    };
    measure();
    window.addEventListener("resize", measure);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const max = Math.max((N - 1) * window.innerHeight, 1);
      const target = window.scrollY;
      smooth += (target - smooth) * (1 - Math.exp(-dt * 5));
      const vScreens =
        (smooth - prev) / Math.max(dt, 1e-4) / Math.max(window.innerHeight, 1);
      prev = smooth;
      scrollRef.current.p = Math.min(Math.max(smooth / max, 0), 1);
      scrollRef.current.v = vScreens;
      for (const it of pxItems) {
        const rel = smooth - it.center;
        it.el.style.transform = `translate3d(0, ${(-rel * it.f).toFixed(1)}px, 0)`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [capable, N]);

  /* 章节跟踪：跨越章节边界时触发一次故障尖峰（VHS 换碟感） */
  useEffect(() => {
    if (!capable) return;
    const onScroll = () => {
      const i = Math.min(
        Math.max(Math.round(window.scrollY / window.innerHeight), 0),
        N - 1
      );
      if (i !== sectionRef.current) {
        sectionRef.current = i;
        setSection(i);
        setGlitchKey((k) => k + 1);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [capable, N]);

  /* 档案模式锁定背景滚动 */
  useEffect(() => {
    if (!capable) return;
    document.documentElement.style.overflow = mode === "detail" ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [capable, mode]);

  /* 键盘：↑↓ 切屏 · 回车进档案 · ESC 返回 */
  useEffect(() => {
    if (!capable) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (mode === "detail") closeDetail();
        else scrollToSection(0);
        return;
      }
      if (mode === "detail") return;
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        scrollToSection(section - 1);
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        scrollToSection(section + 1);
      } else if (e.key === "Enter" && section >= 1 && section <= works.length) {
        openDetail();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [capable, mode, section, scrollToSection, openDetail, closeDetail]);

  const hudLabel =
    mode === "detail"
      ? "ARCHIVE · 作品档案"
      : section === 0
        ? "MENU · 主菜单"
        : section === ABOUT
          ? "ABOUT · 关于"
          : `CHAPTER ${String(section).padStart(2, "0")} · 作品章节`;
  const hudHint =
    mode === "detail" ? "ESC 返回章节" : "滚动浏览 · ↑↓ 切换 · 回车档案 · ESC 回顶部";

  const detailWork = works[activeWork];

  return (
    <>
      {/* 静态内容始终存在于 DOM：无 JS / 不支持设备 / 打印时使用 */}
      <StaticPortfolio hidden={capable} />

      {capable && (
        <div ref={liveRef} className="portfolio-live relative z-40 overflow-clip bg-black text-white">
          {/* 氛围光（固定视口，柔和取向） */}
          <div data-print-hidden="true" className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] bg-indigo-900/20 rounded-full blur-[140px] animate-pulse" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] bg-emerald-900/15 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: "1.6s" }} />
          </div>

          {/* WebGL 层：固定在视口，滚动进度驱动全部布局 */}
          <div data-print-hidden="true" className="fixed inset-0 z-0 pointer-events-none">
            <Scene3D
              mode={mode}
              activeWork={activeWork}
              glitchKey={glitchKey}
              works={works}
              scrollRef={scrollRef}
            />
          </div>

          {/* HUD */}
          <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between pt-16 pb-4 px-4 sm:px-6">
            <div className="flex justify-end">
              <div className="text-right font-mono text-[11px] tracking-[0.22em] text-zinc-500">
                <div className="text-zinc-200 text-xs">RXQ · MIXTAPE</div>
                <div>{hudLabel}</div>
              </div>
            </div>
            <div className="flex items-end justify-between font-mono text-[11px] text-zinc-600">
              <div>液态像素艺术工作室 · 任玄奇作品集</div>
              <div className="text-zinc-500">{hudHint}</div>
            </div>
          </div>

          {/* 章节进度轨道 */}
          <div className="fixed right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5">
            {Array.from({ length: N }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToSection(i)}
                aria-label={
                  i === 0 ? "跳到主菜单" : i === ABOUT ? "跳到关于" : `跳到作品 ${i}`
                }
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === section ? "bg-white scale-125" : "bg-zinc-700 hover:bg-zinc-400"
                }`}
              />
            ))}
          </div>

          {/* 滚动内容层（档案模式下隐藏，避免亮元素透过遮罩形成残影） */}
          <main className={`relative z-10${mode === "detail" ? " invisible" : ""}`}>
            {/* S0 · 主菜单（贴纸） */}
            <section className="relative h-screen">
              <div className="absolute left-[7%] top-1/2 -translate-y-1/2">
                <div data-px="0.05" className="flex flex-col items-start gap-7">
                  <button
                    type="button"
                    onClick={() => scrollToSection(1)}
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
                    onClick={() => scrollToSection(ABOUT)}
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
              </div>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.3em] text-zinc-500 animate-bounce">
                SCROLL ↓
              </div>
            </section>

            {/* S1..SW · 作品章节 */}
            {works.map((w, i) => (
              <section
                key={w.id}
                className="relative h-screen flex items-center overflow-hidden"
              >
                <div
                  data-px="-0.32"
                  aria-hidden="true"
                  className="pointer-events-none select-none absolute right-[5%] top-[8%] text-[24vw] leading-none font-bold text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.13)]"
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="px-[7%] max-w-xl">
                  <p data-px="0.06" className="font-mono text-[11px] tracking-[0.22em] text-zinc-500 mb-5">
                    CHAPTER {String(i + 1).padStart(2, "0")} · 作品章节
                  </p>
                  <h1 data-px="0.03" className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight mb-5">
                    {w.title}
                  </h1>
                  <p data-px="0.09" className="text-zinc-400 text-sm mb-2">
                    {w.year} · {w.medium}
                  </p>
                  <p data-px="0.12" className="font-mono text-xs text-zinc-600 mb-9">
                    {String(i + 1).padStart(2, "0")} / {String(works.length).padStart(2, "0")}
                  </p>
                  <div data-px="0.14" className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={openDetail}
                      className="bg-white text-black px-5 py-2.5 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors"
                    >
                      ▶ 查看档案
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection(i + 2)}
                      className="border border-white/30 px-5 py-2.5 rounded-md text-sm hover:bg-white hover:text-black transition-colors"
                    >
                      下一屏 ↓
                    </button>
                  </div>
                </div>
              </section>
            ))}

            {/* S(N-1) · 关于 */}
            <section className="relative h-screen flex items-center">
              <div className="px-[7%] max-w-xl">
                <p data-px="0.06" className="font-mono text-[11px] tracking-[0.22em] text-zinc-500 mb-5">
                  ABOUT · 关于
                </p>
                <h1 data-px="0.03" className="text-3xl md:text-5xl font-semibold tracking-tight mb-6">
                  任玄奇
                </h1>
                <p data-px="0.09" className="text-zinc-400 text-sm leading-relaxed mb-4">
                  数字艺术创作者、青年学者，硕士毕业于天津美术学院跨媒体艺术专业。以
                  AIGC、生成算法与扩展现实（XR）为主要工具，探索技术图像中的叙事结构与感知经验重构。
                </p>
                <p data-px="0.11" className="text-zinc-400 text-sm leading-relaxed mb-4">
                  作品曾入选第十四届全国美展、中国数字艺术大展、首届青年影像艺术100展、CCF
                  计算艺术大展、海南岛国际电影节等展览。
                </p>
                <p data-px="0.12" className="text-zinc-500 text-sm font-mono leading-relaxed mb-9">
                  微信 r1062046861 · 邮箱 1062046861@qq.com
                </p>
                <div data-px="0.14" className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => scrollToSection(0)}
                    className="border border-white/30 px-5 py-2.5 rounded-md text-sm hover:bg-white hover:text-black transition-colors"
                  >
                    ↑ 回到主菜单
                  </button>
                  <a
                    href="/"
                    className="border border-white/30 px-5 py-2.5 rounded-md text-sm hover:bg-white hover:text-black transition-colors"
                  >
                    返回工作室首页
                  </a>
                </div>
              </div>
            </section>
          </main>

          {/* 作品档案（盒背特写） */}
          {mode === "detail" && (
            <div className="fixed inset-0 z-30">
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent pointer-events-none" />
              <div className="absolute left-[6%] top-1/2 -translate-y-1/2 w-[min(30rem,44vw)] max-h-[86vh] overflow-y-auto pr-2">
                <p className="font-mono text-[11px] tracking-[0.22em] text-zinc-500 mb-4">
                  ARCHIVE · 作品档案
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={detailWork.image}
                  alt={detailWork.title}
                  className="w-full max-h-36 object-cover rounded-lg border border-zinc-800 mb-4"
                />
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
                  {detailWork.title}
                </h1>
                <dl className="border-t border-zinc-800 divide-y divide-zinc-800/70 text-sm mb-4">
                  <div className="flex justify-between py-2">
                    <dt className="text-zinc-500">年份</dt>
                    <dd className="text-zinc-200 font-mono">{detailWork.year}</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-zinc-500">媒介</dt>
                    <dd className="text-zinc-200">{detailWork.medium}</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-zinc-500">编号</dt>
                    <dd className="text-zinc-200 font-mono">{detailWork.id.toUpperCase()}</dd>
                  </div>
                </dl>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">{detailWork.description}</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={closeDetail}
                    className="pointer-events-auto bg-white text-black px-5 py-2.5 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors"
                  >
                    ← 返回章节
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeDetail();
                      scrollToSection(0);
                    }}
                    className="pointer-events-auto border border-white/30 px-5 py-2.5 rounded-md text-sm hover:bg-white hover:text-black transition-colors"
                  >
                    菜单
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
