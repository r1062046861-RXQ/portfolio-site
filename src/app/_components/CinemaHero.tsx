"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import LiquidOpticsCanvas from "./LiquidOpticsCanvas";

type HeroReel = {
  code: string;
  src: string;
  alt: string;
  title: string;
  location: string;
};

const HERO_REELS: HeroReel[] = [
  {
    code: "01",
    src: "/images/88.webp",
    alt: "普达措国家公园 · 首届生态艺术季现场装置",
    title: "普达措国家公园生态艺术季",
    location: "YUNNAN",
  },
  {
    code: "02",
    src: "/images/77.webp",
    alt: "合成生物研究所 · 《地球蓝得像个橘子》气味交互装置",
    title: "合成生物研究所气味装置",
    location: "SHENZHEN",
  },
  {
    code: "03",
    src: "/images/55.webp",
    alt: "上海嘉定文旅 · 城市文旅数字影像",
    title: "上海嘉定城市文旅影像",
    location: "SHANGHAI",
  },
  {
    code: "04",
    src: "/images/66.webp",
    alt: "K11 Select · 商业地产交互气味雕塑《焱泠》",
    title: "K11 商业地产雕塑《焱泠》",
    location: "WUHAN",
  },
];

export default function CinemaHero() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_REELS.length);
    }, 6800);

    return () => window.clearInterval(timer);
  }, []);

  const current = HERO_REELS[activeIndex];

  return (
    <section className="site-section site-hero relative min-h-[660px] h-[100svh] max-h-[1040px] w-full overflow-hidden bg-[#050506]">
      {/* 全出血电影放映银幕 */}
      <div className="absolute inset-0 z-0">
        {HERO_REELS.map((reel, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={reel.code}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
                isActive ? "opacity-100 z-[1]" : "opacity-0 z-0"
              }`}
            >
              <Image
                src={reel.src}
                alt={reel.alt}
                fill
                priority={idx === 0}
                sizes="100vw"
                className={`object-cover object-center ${isActive ? "cinema-drift" : ""}`}
              />
            </div>
          );
        })}

        {/* 暗房电影调色压暗与文字高对比保障渐变 */}
        <div
          className="absolute inset-0 z-[2]"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,5,6,0.58) 0%, rgba(5,5,6,0.18) 38%, rgba(5,5,6,0.68) 72%, #050506 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-[2]"
          style={{
            background:
              "radial-gradient(circle at 18% 82%, rgba(5,5,6,0.88) 0%, rgba(5,5,6,0.45) 45%, transparent 78%), radial-gradient(circle at 90% 82%, rgba(5,5,6,0.9) 0%, rgba(5,5,6,0.46) 36%, transparent 66%)",
          }}
        />
      </div>

      {/* 液态水银边缘光学折射画布 */}
      <LiquidOpticsCanvas />

      {/* 银幕叠加排版层 */}
      <div className="relative z-10 max-w-[1440px] mx-auto h-full px-5 sm:px-8 md:px-12 pt-24 pb-8 sm:pb-12 flex flex-col justify-end">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-12">
          {/* 左下角：片头式大字标题与行动入口（无眉标芯片） */}
          <div className="max-w-2xl cinema-reveal">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-medium tracking-[-0.03em] leading-[1.08] text-[#f5f6f8] mb-5">
              让技术真正服务于
              <br />
              工作与创作
            </h1>

            <p className="text-sm sm:text-base font-medium text-[#c4c7ce] tracking-[0.04em] mb-4">
              企业团队 · 艺术家与创作机构
            </p>

            <p className="text-sm sm:text-base text-[#c4c7ce] max-w-xl leading-[1.8] mb-8">
              我们协助企业团队梳理重复工作、优化协作方式；也帮助艺术家和创作团队把新媒体、影像与影视创意发展为可讨论、可测试、可呈现的作品。
            </p>

            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 bg-[#f5f6f8] text-[#050506] px-6 py-3 text-sm font-medium hover:bg-white/85 transition-colors"
              >
                <span>聊聊你的项目</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <Link
                href="/portfolio/"
                prefetch={false}
                className="inline-flex items-center justify-center gap-2 border border-white/25 bg-[#050506]/45 backdrop-blur-sm text-[#f5f6f8] px-6 py-3 text-sm font-medium hover:border-white/75 hover:bg-white/10 transition-colors"
              >
                <span>浏览任玄奇作品集</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* 右下角：电影放映机时间码、4 幕切镜器与 SCROLL 指示 */}
          <div className="flex items-end justify-between lg:flex-col lg:items-end gap-5 pt-4 lg:pt-0 cinema-reveal-delay">
            <a
              href="#services"
              aria-label="向下浏览合作方向"
              data-print-hidden="true"
              className="hidden lg:inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.24em] text-[#e4e6ec] hover:text-white transition-colors [writing-mode:vertical-rl]"
            >
              <span>SCROLL</span>
              <ArrowDown className="w-3.5 h-3.5 mt-1" aria-hidden="true" />
            </a>

            <div className="flex flex-col lg:items-end gap-3">
              <div className="flex items-center gap-3 text-xs font-mono tracking-[0.16em] tabular-nums">
                <span className="text-[#f5f6f8]">{current.code} / 04</span>
                <span className="text-[#c4c7ce]">·</span>
                <span className="text-[#c4c7ce]">{current.location}</span>
              </div>

              <div className="text-xs text-[#e4e6ec] tracking-wide">
                {current.title}
              </div>

              <div className="flex items-center gap-2" role="group" aria-label="银幕作品切换">
                {HERO_REELS.map((reel, idx) => {
                  const selected = idx === activeIndex;
                  return (
                    <button
                      key={reel.code}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`切换至第 ${reel.code} 幕：${reel.title}`}
                      aria-pressed={selected}
                      className={`px-2.5 py-2 text-[11px] font-mono tabular-nums tracking-[0.14em] transition-colors ${
                        selected
                          ? "text-[#f5f6f8] bg-white/15"
                          : "text-[#c4c7ce] hover:text-[#f5f6f8]"
                      }`}
                    >
                      {reel.code}
                    </button>
                  );
                })}
              </div>
            </div>

            <a
              href="#services"
              aria-label="向下浏览合作方向"
              data-print-hidden="true"
              className="lg:hidden inline-flex items-center gap-1.5 text-xs font-mono tracking-[0.16em] text-[#e4e6ec] hover:text-white py-2"
            >
              <span>SCROLL</span>
              <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
