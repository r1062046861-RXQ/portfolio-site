"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Mail } from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";

const finePointerQuery = "(hover: hover) and (pointer: fine)";

function hasFinePointer() {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(finePointerQuery).matches;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function LoadProgress() {
  const [progress, setProgress] = useState(0);
  const [loadedKB, setLoadedKB] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [done, setDone] = useState(false);
  const estimatedTotalKB = 3500;

  const formatSize = useCallback((kb: number) => {
    if (kb < 1024) return Math.round(kb) + "KB";
    return (kb / 1024).toFixed(1) + "MB";
  }, []);

  useEffect(() => {
    const canMeasureResources =
      typeof window.requestAnimationFrame === "function" &&
      typeof performance !== "undefined" &&
      typeof performance.getEntriesByType === "function";

    if (!canMeasureResources) {
      const fallbackTimer = window.setTimeout(() => setDone(true), 0);
      return () => window.clearTimeout(fallbackTimer);
    }

    let lastBytes = 0;
    let lastTime = performance.now();
    let rafId: number;
    let finished = false;

    const tick = () => {
      if (finished) return;

      const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const total = entries.length;
      const loaded = entries.filter(e => e.responseEnd > 0).length;

      const currentBytes = entries.reduce((sum, e) => {
        if (e.transferSize > 0) return sum + e.transferSize;
        if (e.decodedBodySize > 0) return sum + e.decodedBodySize;
        return sum;
      }, 0);

      const now = performance.now();
      const deltaTime = now - lastTime;
      const deltaBytes = currentBytes - lastBytes;

      if (deltaTime > 300 && deltaBytes > 0) {
        const speedKBps = (deltaBytes / 1024) / (deltaTime / 1000);
        setSpeed(Math.max(0, speedKBps));
        lastBytes = currentBytes;
        lastTime = now;
      }

      const kb = currentBytes / 1024;
      setLoadedKB(kb);

      if (total > 0) {
        const pct = Math.min(Math.round((loaded / total) * 100), 99);
        setProgress(pct);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    const hide = () => {
      finished = true;
      window.cancelAnimationFrame(rafId);
      setProgress(100);
      setLoadedKB(estimatedTotalKB);
      setSpeed(0);
      setTimeout(() => setDone(true), 400);
    };

    if (document.readyState === "complete") {
      window.setTimeout(hide, 0);
    } else {
      window.addEventListener("load", hide);
    }
    const maxTimer = setTimeout(hide, 10000);

    return () => {
      finished = true;
      window.cancelAnimationFrame(rafId);
      clearTimeout(maxTimer);
      window.removeEventListener("load", hide);
    };
  }, []);

  if (done) return null;

  return (
    <div className="w-full">
      <div className="w-full h-[2px] mt-1 bg-white/15 overflow-hidden rounded-full">
        <motion.div
          className="h-full bg-white/90 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.15 }}
        />
      </div>
      <div className="flex mt-0.5">
        <span className="text-white/40 text-[10px] font-mono leading-none">
          {speed > 0 ? formatSize(speed) + "/s · " : ""}{formatSize(loadedKB)} / {formatSize(estimatedTotalKB)}
        </span>
      </div>
    </div>
  );
}

// 全局鼠标跟随高光组件
function CursorGlow() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  useEffect(() => {
    if (hasFinePointer() && !prefersReducedMotion()) {
      setIsDesktop(true);
    }
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      const updatePointer = () => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        if (!isVisible) setIsVisible(true);
      };

      if (typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(updatePointer);
      } else {
        updatePointer();
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    document.body.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible, isDesktop]);

  if (!isDesktop) return null;

  return (
    <motion.div
      className="cursor-glow pointer-events-none fixed inset-0 z-40 overflow-hidden mix-blend-screen"
      style={{ opacity: isVisible ? 1 : 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[60px] -translate-x-1/2 -translate-y-1/2"
        style={{
          x: mouseX,
          y: mouseY,
        }}
      />
    </motion.div>
  );
}

// 可复用的 3D 悬浮透视卡片包装组件
function TiltWrapper({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHoverable, setIsHoverable] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  useEffect(() => {
    if (hasFinePointer() && !prefersReducedMotion()) {
      setIsHoverable(true);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !isHoverable) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    if (!isHoverable) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{ perspective: isHoverable ? 1200 : "none" }}
      className="h-full"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: isHoverable ? rotateX : 0,
          rotateY: isHoverable ? rotateY : 0,
          transformStyle: isHoverable ? "preserve-3d" : "flat",
        }}
        className={className}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ponytail: decorative SVG keeps desktop visual texture optional and leaves old/mobile browsers on the static layout.
function DesktopSignalField() {
  return (
    <div className="desktop-signal-field" aria-hidden="true">
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <linearGradient id="signal-line" x1="0" x2="1">
            <stop offset="0" stopColor="#22c55e" stopOpacity="0" />
            <stop offset="0.45" stopColor="#a78bfa" stopOpacity="0.8" />
            <stop offset="1" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="signal-core">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="0.2" stopColor="#a78bfa" stopOpacity="0.45" />
            <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className="signal-grid">
          <path d="M0 600 C250 460 470 690 720 500 S1040 300 1200 430" stroke="url(#signal-line)" />
          <path d="M-40 690 C230 540 470 760 770 570 S1020 410 1240 540" stroke="url(#signal-line)" />
          <path d="M120 800 L620 80 L1040 800" stroke="url(#signal-line)" />
        </g>
        <g className="signal-orbit">
          <ellipse cx="900" cy="260" rx="245" ry="92" />
          <ellipse cx="900" cy="260" rx="245" ry="92" transform="rotate(58 900 260)" />
          <ellipse cx="900" cy="260" rx="245" ry="92" transform="rotate(-58 900 260)" />
        </g>
        <circle className="signal-core" cx="900" cy="260" r="118" fill="url(#signal-core)" />
        <circle className="signal-dot signal-dot-one" cx="1070" cy="190" r="5" />
        <circle className="signal-dot signal-dot-two" cx="780" cy="350" r="4" />
      </svg>
    </div>
  );
}

export default function Home() {
  return (
    <main className="site-shell flex flex-col min-h-screen">
      {/* 全局鼠标高光 */}
      <CursorGlow />
      
      {/* 导航栏 */}
      <nav className="site-nav fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 mix-blend-difference text-white">
        <div className="shrink-0">
          <div className="font-bold text-sm sm:text-lg tracking-tight whitespace-nowrap">液态像素艺术工作室</div>
          <LoadProgress />
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium">
          <a href="#services" className="hover:opacity-70 transition-opacity p-2">合作方向</a>
          <a href="#works" className="hover:opacity-70 transition-opacity p-2">创作实践</a>
          <a href="#team" className="hover:opacity-70 transition-opacity p-2">关于我们</a>
        </div>
        <a href="#contact" className="border border-white/30 px-4 py-2 rounded-md text-sm hover:bg-white hover:text-black transition-colors">
          预约咨询
        </a>
      </nav>

      {/* 首屏 Hero Section */}
      <section className="site-section site-hero relative flex flex-col justify-center min-h-screen px-4 sm:px-8 md:px-12 pt-20 overflow-hidden bg-black">
        {/* 高级创意背景：AIGC 光影 + 科技网格 */}
        <div data-print-hidden="true" className="absolute inset-0 z-0 bg-zinc-950 overflow-hidden">
          {/* 动态模糊光球 (模拟 Generative Art 呼吸感) */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-indigo-900/30 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-emerald-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* 几何网格纹理 (代表算法与工程) */}
          <div className="absolute inset-0 bg-grid-pattern opacity-60"></div>
          
          {/* 底部渐变过渡 */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/80 to-zinc-950 z-0" />
        </div>
        <DesktopSignalField />
        
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-start justify-center">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-4xl mx-auto flex flex-col items-center text-center"
          >
            <p className="text-xs sm:text-sm font-mono tracking-[0.18em] text-zinc-400 mb-6">企业团队 · 艺术家与创作机构</p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] mb-6">
              让技术真正服务于<br className="hidden sm:block" />工作与创作
            </h1>
            <p className="text-zinc-400 text-base sm:text-lg md:text-xl max-w-3xl font-normal leading-relaxed">
              我们协助企业团队梳理重复工作、优化协作方式；也帮助艺术家和创作团队把新媒体、影像与影视创意发展为可讨论、可测试、可呈现的作品。
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {["让工作少绕弯", "让创意能落地", "新媒体与影视技术"].map((item) => (
                <span key={item} className="px-3 py-1.5 rounded-full border border-zinc-700/70 bg-zinc-900/60 text-zinc-300 text-xs sm:text-sm">
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
            className="w-full flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-10"
          >
            <a href="#contact" className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 md:px-8 md:py-4 rounded-md font-medium hover:bg-zinc-200 transition-colors w-full sm:w-auto text-center">
              聊聊你的项目 <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#services" className="flex items-center justify-center border border-white/25 text-white px-6 py-3 md:px-8 md:py-4 rounded-md font-medium hover:bg-white/10 transition-colors w-full sm:w-auto text-center">
              看看我们能做什么
            </a>
          </motion.div>
        </div>
      </section>

      {/* 服务项目 Services Section */}
      <section id="services" className="site-section py-20 md:py-32 px-4 sm:px-8 md:px-12 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-10 md:mb-16">
            <p className="text-xs sm:text-sm font-mono tracking-[0.18em] text-zinc-500 mb-4">合作方向</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-5">让工作顺畅，也让创作落地</h2>
            <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
              我们从一件具体的事开始：企业团队里总在重复、卡住的工作，或艺术家与创作团队正在寻找技术路径的创作构想。一起找到合适做法，再把它落实为团队或作品可持续使用的成果。
            </p>
          </div>
          <div className="relative">
            <div className="mx-auto w-fit rounded-lg border border-zinc-700 bg-black px-5 py-4 text-center">
              <p className="text-xs font-mono tracking-[0.16em] text-zinc-500 mb-1">合作路径</p>
              <p className="text-base font-medium text-zinc-100">从一件具体的事开始</p>
            </div>
            <div aria-hidden="true" className="relative hidden h-12 md:block">
              <span className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-zinc-700" />
              <span className="absolute left-1/4 right-1/4 top-5 h-px bg-zinc-700" />
              <span className="absolute left-1/4 top-5 h-7 w-px -translate-x-1/2 bg-zinc-700" />
              <span className="absolute left-3/4 top-5 h-7 w-px -translate-x-1/2 bg-zinc-700" />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-8 md:mt-0 md:grid-cols-2 md:gap-12">
              {[
                {
                  audience: "给企业团队",
                  title: "把重复的工作，变成更顺手的做法",
                  desc: "围绕真实工作流程，留下能复用的操作步骤、模板和检查清单。",
                  panelClass: "border-indigo-400/30 bg-indigo-950/20",
                  labelClass: "text-indigo-200",
                  lineClass: "border-indigo-400/40",
                  markerClass: "border-indigo-400/60 bg-indigo-950 text-indigo-100",
                  tagClass: "border-indigo-400/20 text-indigo-100",
                  steps: [
                    {
                      title: "先找出最费时间的事",
                      desc: "一起看看哪些事情总在重复、容易卡住或花很久时间，优先从最值得改善的地方开始。",
                      tags: ["找问题", "排先后", "用得放心"]
                    },
                    {
                      title: "用自己的工作来练",
                      desc: "拿正在做的材料、项目和沟通任务一起练，把新的做法变成团队日常能用的流程。",
                      tags: ["边做边学", "当天能用", "团队一起练"]
                    }
                  ]
                },
                {
                  audience: "给艺术家与创作团队",
                  title: "把创作想法，推进到可以呈现的样子",
                  desc: "围绕新媒体、交互、影像与影视制作，提供从测试到呈现的技术协作。",
                  panelClass: "border-emerald-400/30 bg-emerald-950/15",
                  labelClass: "text-emerald-200",
                  lineClass: "border-emerald-400/40",
                  markerClass: "border-emerald-400/60 bg-emerald-950 text-emerald-100",
                  tagClass: "border-emerald-400/20 text-emerald-100",
                  steps: [
                    {
                      title: "先把想法做成能看到的样子",
                      desc: "先制作能讨论的视觉测试、技术样机或短段落，再决定下一步怎么走。",
                      tags: ["视觉测试", "技术样机", "创作讨论"]
                    },
                    {
                      title: "从样机到展映一起把关",
                      desc: "根据展示场地、叙事需要和制作条件，梳理技术路线，让作品走向展览、展映或现场呈现。",
                      tags: ["新媒体技术", "影像制作", "现场呈现"]
                    }
                  ]
                }
              ].map((branch, branchIndex) => (
                <TiltWrapper key={branch.audience} delay={branchIndex * 0.1} className="site-card h-full rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 md:p-8">
                  <article>
                    <header className={`rounded-lg border p-5 ${branch.panelClass}`}>
                      <p className={`text-xs font-mono tracking-[0.16em] mb-3 ${branch.labelClass}`}>{branch.audience}</p>
                      <h3 className="text-xl md:text-2xl font-medium text-zinc-100 mb-3">{branch.title}</h3>
                      <p className="text-sm md:text-base leading-relaxed text-zinc-400">{branch.desc}</p>
                    </header>
                    <ol className={`relative mt-5 space-y-4 border-l pl-6 ${branch.lineClass}`}>
                      {branch.steps.map((step, stepIndex) => (
                        <li key={step.title} className="relative">
                          <span className={`absolute -left-[2.5rem] top-5 grid h-8 w-8 place-items-center rounded-full border text-xs font-mono ${branch.markerClass}`}>{String(stepIndex + 1).padStart(2, "0")}</span>
                          <article className="rounded-lg border border-zinc-800 bg-black p-5">
                            <h4 className="text-base md:text-lg font-medium text-zinc-100 mb-2">{step.title}</h4>
                            <p className="text-sm leading-relaxed text-zinc-400">{step.desc}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              {step.tags.map((tag) => (
                                <span key={tag} className={`rounded border px-2.5 py-1 text-xs ${branch.tagClass}`}>{tag}</span>
                              ))}
                            </div>
                          </article>
                        </li>
                      ))}
                    </ol>
                  </article>
                </TiltWrapper>
              ))}
            </div>
          </div>
          <div className="mt-6 md:mt-8 p-6 md:p-8 rounded-lg border border-zinc-800 bg-black flex flex-col md:flex-row md:items-center justify-between gap-6">
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-3xl">
              无论是一件总让团队费时间的工作，还是一个还没找到做法的创作想法，都可以从一件具体的事开始。
            </p>
            <a href="#contact" className="shrink-0 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-zinc-300 transition-colors">
              从一个具体问题开始 <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 案例展示 Selected Works */}
      <section id="works" className="site-section py-20 md:py-32 px-4 sm:px-8 md:px-12 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-4">
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight">创作、影像与新媒体实践</h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-md">从影像、展览、交互装置到公共艺术，持续把创意、协作与技术落实到真实项目中。</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {[
              {
                client: "天津美术学院 & 天津青年宫",
                project: "社会美育与疗愈工作坊",
                category: "艺术工作坊",
                desc: "策划并落地社会参与性艺术活动，在公共空间中唤起个体的审美感知，将艺术创意与情感疗愈深度结合。",
                image: "/images/11.webp"
              },
              {
                client: "天津美术学院",
                project: "AI 艺术高研班",
                category: "教学与培训",
                desc: "担任人工智能艺术高研班艺术创作导师，提供专业的生成式 AI 技能培训与数字艺术创作指导。",
                image: "/images/22.webp"
              },
              {
                client: "快手磁力引擎",
                project: "年度宣传影像",
                category: "视觉创意",
                desc: "结合图像拼贴与动态视频技术，为平台活动制作宣传影像。",
                image: "/images/33.webp"
              },
              {
                client: "中国科学技术馆",
                project: "音乐可视化项目",
                category: "场馆展示",
                desc: "制作光影与音律结合的动态视觉，应用于场馆的科学与艺术传播活动。",
                image: "/images/44.webp"
              },
              {
                client: "上海嘉定文旅",
                project: "城市文旅数字影像",
                category: "文化展示",
                desc: "运用数字特效与风格化转绘，制作展现城市历史与风貌的高质量视频内容，助力文旅 IP 传播。",
                image: "/images/55.webp"
              },
              {
                client: "K11 Select",
                project: "商业地产气味雕塑",
                category: "实体公共艺术",
                desc: "为 K11 跬步计划设计并落地《焱泠》交互气味雕塑，结合物理材料与程序控制，提升商业空间艺术氛围。",
                image: "/images/66.webp"
              },
              {
                client: "合成生物研究所",
                project: "气味交互艺术展",
                category: "气味与科技艺术",
                desc: "将合成生物学概念转化为《地球蓝得像个橘子》交互装置，通过嗅觉与视觉的跨界结合实现科学概念的艺术表达。",
                image: "/images/77.webp"
              },
              {
                client: "非物质文化遗产",
                project: "杨柳青与红楼梦数字焕新",
                category: "文化 IP 数字化",
                desc: "提取传统经典视觉特征，定向炼制专属 AIGC 图像生成模型，实现非物质文化遗产的当代数字视觉重构与跨媒介传播。",
                image: "/images/99.webp"
              },
              {
                client: "普达措国家公园",
                project: "首届生态艺术季",
                category: "展览策划与驻地",
                desc: "策划并执行大型自然生态公共艺术季，在自然林木间构建在地可持续装置，打造自然与人文对话的疗愈展览场域。",
                image: "/images/88.webp"
              },
              {
                client: "深圳南头古城",
                project: "《桃源秘境》商业展",
                category: "在地公共艺术装置",
                desc: "策划并落地结合藏南民艺与岭南元素的沉浸式商业文化展览，将大地叙事转化为可体验的户外探索产品与空间陈设。",
                image: "/images/100.webp"
              }
            ].map((work, idx) => (
              <TiltWrapper 
                key={idx}
                delay={idx * 0.1}
                className="site-card site-work-card group relative h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 p-4 md:p-6 flex flex-col justify-end"
              >
                {/* 案例图片 */}
                <Image 
                  src={work.image} 
                  alt={work.project} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-100" 
                />
                
                {/* 悬停时的微光效果 (代表灵感/AIGC) */}
                <div data-print-hidden="true" className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay z-10" />

                <div data-print-hidden="true" className="site-image-scrim absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10 group-hover:from-black/100 group-hover:via-black/70 transition-colors duration-300" />
                
                <div className="relative z-20 transform transition-transform duration-300 md:translate-y-4 md:group-hover:translate-y-0" style={{ transform: "translateZ(30px)" }}>
                  <div className="text-xs md:text-sm font-medium text-zinc-300 mb-1 md:mb-2">{work.category}</div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-1 md:mb-2">
                    {work.client} <span className="font-normal text-zinc-400 text-base md:text-xl block sm:inline sm:ml-2 mt-1 sm:mt-0">{work.project}</span>
                  </h3>
                  <p className="text-zinc-400 text-sm md:text-base md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 mt-2">
                    {work.desc}
                  </p>
                </div>
              </TiltWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* 展览与荣誉 Awards Section */}
      <section id="awards" className="site-section py-20 md:py-32 px-4 sm:px-8 md:px-12 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-4">
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight">展览与荣誉</h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-md">团队成员受邀参与的部分国内外顶级学术展览与电影节。</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { year: "2026", title: "第十六届北京国际电影节", desc: "无界∞沉浸单元 / 国际A类电影节" },
              { year: "2025", title: "第七届海南岛国际电影节", desc: "未来影像展 / 国际电影节" },
              { year: "2025", title: "第七届青岛国际双年展", desc: "大型国际当代艺术双年展" },
              { year: "2025", title: "普达措生态艺术季", desc: "国家公园 / 大型自然生态公共艺术展" },
              { year: "2025", title: "CCF 计算艺术大展", desc: "中国计算机学会 / 顶尖学术科技跨界展" },
              { year: "2024", title: "第十四届全国美术作品展览", desc: "实验艺术、数字艺术与动画展区 / 国家级最高展" },
              { year: "2024", title: "首届中国数字艺术大展", desc: "中国美术馆 / 国家级数字艺术大展" },
              { year: "2024", title: "深圳先进院合成生物研究所艺术展", desc: "跨界科技艺术展 / 深圳" }
            ].map((award, idx) => (
              <TiltWrapper 
                key={idx}
                delay={idx * 0.05}
                className="site-card group p-5 md:p-6 bg-black border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors flex flex-col h-full"
              >
                <div className="text-zinc-500 font-mono text-xs sm:text-sm mb-3 group-hover:text-zinc-400 transition-colors" style={{ transform: "translateZ(10px)" }}>{award.year}</div>
                <h3 className="text-zinc-200 font-medium text-base sm:text-lg mb-2 leading-snug" style={{ transform: "translateZ(20px)" }}>{award.title}</h3>
                <p className="text-zinc-500 text-xs sm:text-sm mt-auto" style={{ transform: "translateZ(15px)" }}>{award.desc}</p>
              </TiltWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* 学术成果 Research Section */}
      <section id="research" className="site-section py-20 md:py-32 px-4 sm:px-8 md:px-12 bg-black border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-4">
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight">学术成果</h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-2xl">
              包含团队成员的论文发表、科研项目、论坛发言与学术交流，体现理论研究、跨学科方法与艺术实践之间的持续联动。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                year: "2025",
                title: "第十四届北京国际电影节第六届国际青年学者论坛",
                desc: "围绕影像研究、当代艺术与技术方法参与国际青年学术交流，拓展电影节语境下的跨学科讨论。",
                image: "/images/aa.webp"
              },
              {
                year: "2025",
                title: "第十届网络社会年会青年学者论坛",
                desc: "参与网络社会语境下的青年学术论坛交流，持续推进数字影像、算法文化与网络社会研究的交叉讨论。",
                image: "/images/bb.webp"
              },
              {
                year: "2025",
                title: "新媒体与非物质文化遗产传承创新学术论坛",
                desc: "参与中央民族大学相关学术论坛交流，围绕新媒体语境下的非物质文化遗产传承、创新转化与数字传播展开讨论。",
                image: "/images/cc.webp"
              },
              {
                year: "2025",
                title: "国家艺术基金沉浸式交互动漫人工智能创作人才培养资助项目",
                desc: "参与国家艺术基金人才培养项目，由中国动漫集团发起，聚焦沉浸式交互、动漫叙事与人工智能创作方法。",
                image: "/images/dd.webp"
              },
              {
                year: "2023",
                title: "国家艺术基金数字博物馆数字艺术人才培训资助项目",
                desc: "参与国家艺术基金数字艺术人才培训项目，由文化和旅游部艺术发展中心发起，聚焦数字博物馆与数字艺术方法。",
                image: "/images/ee.webp"
              },
              {
                year: "2022-2024",
                title: "科研项目与教学研究",
                desc: "主持并参与天津市科研创新项目，包括《基于人机交互技术的 OMO 智慧教学应用模式研究》与《三维游戏“一公米线上实体店”建设研究项目》等。",
                image: "/images/ff.webp"
              }
            ].map((item, idx) => (
              <TiltWrapper
                key={idx}
                delay={idx * 0.05}
                className="site-card site-research-card group relative min-h-[250px] md:min-h-[300px] p-5 md:p-6 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors flex flex-col justify-between overflow-hidden"
              >
                {/* 背景图片 */}
                <Image 
                  src={item.image} 
                  alt={item.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-40 group-hover:opacity-80" 
                />
                
                {/* 悬停时的微光效果 */}
                <div data-print-hidden="true" className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay z-10" />

                {/* 均衡的全覆盖半透明黑色暗层：调整默认透明度为 45%，悬停时变亮为 25% */}
                <div data-print-hidden="true" className="absolute inset-0 bg-black/45 group-hover:bg-black/25 transition-colors duration-500 z-10" />

                {/* 顶部区域：年份和主标题（悬停时向上推） */}
                <div className="relative z-20 flex flex-col transition-transform duration-500 md:group-hover:-translate-y-2">
                  <div className="mb-3" style={{ transform: "translateZ(10px)" }}>
                    <span className="text-zinc-300 font-mono text-xs sm:text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm">{item.year}</span>
                  </div>
                  <h3 className="text-zinc-100 font-medium text-lg md:text-xl leading-snug" style={{ transform: "translateZ(20px)" }}>
                    {item.title}
                  </h3>
                </div>

                {/* 底部区域：描述文字（默认显示，悬停时向下推） */}
                <p className="relative z-20 text-zinc-400 text-sm md:text-base leading-relaxed mt-4 transition-transform duration-500 md:group-hover:translate-y-2" style={{ transform: "translateZ(15px)" }}>
                  {item.desc}
                </p>
              </TiltWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* 团队成员 Team Section */}
      <section id="team" className="site-section py-20 md:py-32 px-4 sm:px-8 md:px-12 bg-black border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-10 md:mb-16 text-left md:text-center md:mx-auto">
            <p className="text-xs sm:text-sm font-mono tracking-[0.18em] text-zinc-500 mb-4">我们是谁</p>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight mb-5">一个把技术放进真实工作与创作现场的工作室</h2>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">液态像素艺术工作室由艺术家与技术实践者组成。我们将影像、动画、新媒体、交互和影视制作经验，与人工智能和数字工具的实际应用结合起来：为企业团队优化具体工作流程，也与艺术家和创作团队共同把想法发展为可测试、可呈现的作品。</p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
            <TiltWrapper delay={0.1} className="site-card bg-black p-6 sm:p-8 md:p-10 rounded-xl border border-zinc-800 h-full">
              <div className="flex items-center gap-4 mb-6" style={{ transform: "translateZ(30px)" }}>
                <div className="relative shrink-0 aspect-square w-16 md:w-20 rounded-full overflow-hidden border border-zinc-700">
                  <Image src="/images/rxq.webp" alt="任玄奇" fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-1">任玄奇</h3>
                  <p className="text-zinc-400 text-sm md:text-base">动画导演 / 北京电影学院博士研究生 / 青年学者</p>
                </div>
              </div>
              
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-6" style={{ transform: "translateZ(20px)" }}>
                研究科技艺术与跨媒体艺术，聚焦人工智能时代的影像与动画创作；也在编程、装置、新媒体和虚拟现实等实践中，将创意发展为可测试、可呈现的作品。
              </p>
              <div className="text-xs md:text-sm text-zinc-500 space-y-1.5" style={{ transform: "translateZ(10px)" }}>
                <p>学术与研修：国家艺术基金数字博物馆数字艺术人才培训、沉浸式交互动漫人工智能创作人才培养</p>
                <p>教学经历：2024–2026 天津美术学院人工智能艺术通识课及高级研修班</p>
                <p>展览与展映：中国数字艺术大展、全国美展、CCF 计算艺术大展及北京／海南岛国际电影节等</p>
              </div>
            </TiltWrapper>

            <TiltWrapper delay={0.2} className="site-card bg-black p-6 sm:p-8 md:p-10 rounded-xl border border-zinc-800 h-full">
              <div className="flex items-center gap-4 mb-6" style={{ transform: "translateZ(30px)" }}>
                <div className="relative shrink-0 aspect-square w-16 md:w-20 rounded-full overflow-hidden border border-zinc-700">
                  <Image src="/images/wyf.webp" alt="吴于枫" fill className="object-cover scale-[1.25] origin-top translate-x-2 -translate-y-2" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-1">吴于枫</h3>
                  <p className="text-zinc-400 text-sm md:text-base">气味与新媒体艺术家 / NAHA高阶芳疗师</p>
                </div>
              </div>
              
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-6" style={{ transform: "translateZ(20px)" }}>
                专注于新媒体公共艺术、疗愈空间构建与多感官交互。擅长将气味艺术与新兴数字媒介结合，联动五感，为商业地产、自然文旅及公共空间提供极具人文哲思与情感疗愈的沉浸式体验解决方案。
              </p>
              <div className="text-xs md:text-sm text-zinc-500 space-y-1.5" style={{ transform: "translateZ(10px)" }}>
                <p>参与展览：北京/海南岛国际电影节、青岛国际双年展、普达措生态艺术季等</p>
                <p>专业资质：CIBTAC整全疗愈师</p>
              </div>
            </TiltWrapper>

          </div>
        </div>
      </section>

      {/* 联系我们 Contact Section */}
      <section id="contact" className="site-section py-20 md:py-32 px-4 sm:px-8 md:px-12 bg-black flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-6">聊聊一个工作难题，或一个创作想法</h2>
        <p className="text-zinc-400 text-sm md:text-base mb-12 md:mb-16 max-w-lg mx-auto px-4">
          不管是团队总在重复做表格、写材料、整理信息，还是你正在准备新媒体、互动、影像或影视作品，欢迎带着一个具体问题来聊。我们会先听懂现状，再一起判断什么做法更合适。
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">
          {/* 微信二维码 */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-black rounded-xl flex items-center justify-center mb-4 overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-colors p-3">
              <div className="relative w-full h-full scale-[1.2] -translate-y-1">
                <Image 
                  src="/images/qrcode_dark.webp" 
                  alt="微信二维码" 
                  fill 
                  priority
                  className="object-contain mix-blend-screen opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
            <span className="text-zinc-300 font-medium">扫码聊聊合作可能</span>
            <span className="text-zinc-500 text-sm mt-1">Feuille_1100</span>
          </div>
          
          {/* 分割线 */}
          <div className="h-px w-32 md:w-px md:h-32 bg-zinc-800"></div>
          
          {/* 邮箱联系 */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-black border border-zinc-800 rounded-full flex items-center justify-center mb-4 hover:border-zinc-600 transition-colors">
              <Mail className="w-10 h-10 text-zinc-500" />
            </div>
            <a href="mailto:feuillefeng@foxmail.com" className="text-zinc-300 font-medium hover:text-white transition-colors">邮件预约交流</a>
            <span className="text-zinc-500 text-sm mt-1">feuillefeng@foxmail.com</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer py-6 text-center text-zinc-600 text-xs md:text-sm border-t border-zinc-900 bg-black">
        <p>© {new Date().getFullYear()} 液态像素艺术工作室 · 企业团队与艺术家技术协作</p>
      </footer>
    </main>
  );
}
