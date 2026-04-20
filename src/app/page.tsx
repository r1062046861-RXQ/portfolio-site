"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Mail } from "lucide-react";
import { useRef, useEffect, useState } from "react";

// 全局鼠标跟随高光组件
function CursorGlow() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  useEffect(() => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      setIsDesktop(true);
    }
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      // 增加 requestAnimationFrame 来优化高频的鼠标移动事件性能
      requestAnimationFrame(() => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        if (!isVisible) setIsVisible(true);
      });
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
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden mix-blend-screen"
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
function TiltWrapper({ children, className, delay = 0, margin = "0px" }: { children: React.ReactNode, className?: string, delay?: number, margin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHoverable, setIsHoverable] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  useEffect(() => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
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
      initial={{ opacity: 0.001, y: 20 }}
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

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* 全局鼠标高光 */}
      <CursorGlow />
      
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 mix-blend-difference text-white">
        <div className="font-bold text-lg tracking-tight">液态像素艺术工作室</div>
        <div className="hidden md:flex gap-6 text-sm font-medium">
          <a href="#services" className="hover:opacity-70 transition-opacity p-2">服务项目</a>
          <a href="#works" className="hover:opacity-70 transition-opacity p-2">案例展示</a>
          <a href="#awards" className="hover:opacity-70 transition-opacity p-2">展览荣誉</a>
          <a href="#research" className="hover:opacity-70 transition-opacity p-2">学术成果</a>
          <a href="#team" className="hover:opacity-70 transition-opacity p-2">团队成员</a>
        </div>
        <a href="#contact" className="border border-white/30 px-4 py-2 rounded-md text-sm hover:bg-white hover:text-black transition-colors">
          联系我们
        </a>
      </nav>

      {/* 首屏 Hero Section */}
      <section className="relative flex flex-col justify-center min-h-screen px-4 sm:px-8 md:px-12 pt-20 overflow-hidden bg-black">
        {/* 高级创意背景：AIGC 光影 + 科技网格 */}
        <div className="absolute inset-0 z-0 bg-zinc-950 overflow-hidden">
          {/* 动态模糊光球 (模拟 Generative Art 呼吸感) */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-indigo-900/30 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-emerald-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* 几何网格纹理 (代表算法与工程) */}
          <div className="absolute inset-0 bg-grid-pattern opacity-60"></div>
          
          {/* 底部渐变过渡 */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/80 to-zinc-950 z-0" />
        </div>
        
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-start justify-center">
          <motion.div
            initial={{ opacity: 0.001, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full flex flex-col items-center justify-center mb-8"
          >
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-5">
              {[
                { text: "人工智能", delay: 0 },
                { text: "数字影像", delay: 0.1 },
                { text: "多感官交互", delay: 0.2 },
                { text: "公共艺术", delay: 0.3 },
                { text: "算法美学", delay: 0.4 }
              ].map((pill, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: pill.delay,
                    type: "spring", 
                    stiffness: 100 
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5, 
                    boxShadow: "0 10px 25px -5px rgba(129, 140, 248, 0.3)" 
                  }}
                  className="px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full border border-zinc-700/50 bg-zinc-900/60 backdrop-blur-md text-zinc-200 text-lg sm:text-xl md:text-2xl font-medium tracking-wide shadow-xl cursor-default"
                >
                  {pill.text}
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0.001, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            className="w-full flex justify-center"
          >
            <p className="text-zinc-400 text-base sm:text-lg md:text-xl max-w-3xl font-normal leading-relaxed mb-10 text-center">
              由跨媒体艺术创作者与青年学者组建的复合型团队。致力于将前沿算法与多元媒介深度融合，提供涵盖数字影像创意、多感官公共艺术、文化 IP 数字化、定制化网页交互开发及 AIGC 技能培训的综合解决方案。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0.001, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
            className="w-full flex justify-center gap-4"
          >
            <a href="#services" className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 md:px-8 md:py-4 rounded-md font-medium hover:bg-zinc-200 transition-colors w-full sm:w-auto text-center">
              查看服务 <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* 服务项目 Services Section */}
      <section id="services" className="py-20 md:py-32 px-4 sm:px-8 md:px-12 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight mb-10 md:mb-16">核心服务</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "艺术工作坊与 AIGC 培训",
                desc: "策划并落地结合艺术创意与数字技术的线下工作坊。同时面向高校、企业及创作者提供前沿的生成式 AI 技能培训与艺术创作指导。",
                tags: ["AIGC 技能培训", "艺术创意", "创意工作坊"]
              },
              {
                title: "数字影像创意",
                desc: "为品牌宣传、活动影像提供前沿的 AI 视觉生成与动态视频制作服务。",
                tags: ["AIGC", "宣传影像", "动态视觉"]
              },
              {
                title: "多感官交互与公共艺术",
                desc: "结合气味艺术、实验影像与新媒体交互技术，为商业地产及自然文旅空间打造多维度的沉浸式数字艺术与疗愈体验。",
                tags: ["新媒体交互", "气味艺术", "沉浸式空间"]
              },
              {
                title: "文化 IP 数字化焕新",
                desc: "运用数字媒体技术与生成算法，协助传统文化资产与文旅项目进行数字化展示与跨界传播。",
                tags: ["文旅展示", "数字媒体", "文化传播"]
              },
              {
                title: "艺术展览与空间策划",
                desc: "结合生态疗愈与前沿数字艺术，为公共文化空间及商业地产提供从概念策划到作品落地的完整展览解决方案。",
                tags: ["展览策划", "公共文化空间", "艺术陈设"]
              },
              {
                title: "数字交互与网页开发",
                desc: "提供从视觉设计到前端开发的定制化网页解决方案，以及基于游戏引擎的 3D 互动体验开发，打造新型交互数字平台。",
                tags: ["UI/UX设计", "前端开发", "3D互动引擎"]
              }
            ].map((service, idx) => (
              <TiltWrapper 
                key={idx}
                delay={idx * 0.1}
                margin="-50px"
                className="relative p-6 md:p-8 rounded-lg flex flex-col h-full overflow-hidden transition-all duration-300 hover:bg-zinc-800/80 bg-zinc-900/50 border border-zinc-800"
              >
                <h3 className="text-xl font-medium mb-3 text-zinc-100" style={{ transform: "translateZ(30px)" }}>
                  {service.title}
                </h3>
                <p className="text-sm md:text-base mb-6 leading-relaxed flex-grow text-zinc-400" style={{ transform: "translateZ(20px)" }}>
                  {service.desc}
                </p>
                <div className="flex flex-wrap gap-2 mt-auto" style={{ transform: "translateZ(40px)" }}>
                  {service.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded border bg-black border-zinc-800 text-zinc-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </TiltWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* 案例展示 Selected Works */}
      <section id="works" className="py-20 md:py-32 px-4 sm:px-8 md:px-12 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-4">
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight">案例展示</h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-md">包含商业传播、场馆展示及技术研发落地项目。</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {[
              {
                client: "天津美术学院 & 天津青年宫",
                project: "社会美育与疗愈工作坊",
                category: "艺术工作坊",
                desc: "策划并落地社会参与性艺术活动，在公共空间中唤起个体的审美感知，将艺术创意与情感疗愈深度结合。",
                image: "/images/11.png"
              },
              {
                client: "天津美术学院",
                project: "AI 艺术高研班",
                category: "教学与培训",
                desc: "担任人工智能艺术高研班艺术创作导师，提供专业的生成式 AI 技能培训与数字艺术创作指导。",
                image: "/images/22.jpg"
              },
              {
                client: "快手磁力引擎",
                project: "年度宣传影像",
                category: "视觉创意",
                desc: "结合图像拼贴与动态视频技术，为平台活动制作宣传影像。",
                image: "/images/33.png"
              },
              {
                client: "中国科学技术馆",
                project: "音乐可视化项目",
                category: "场馆展示",
                desc: "制作光影与音律结合的动态视觉，应用于场馆的科学与艺术传播活动。",
                image: "/images/44.png"
              },
              {
                client: "上海嘉定文旅",
                project: "城市文旅数字影像",
                category: "文化展示",
                desc: "运用数字特效与风格化转绘，制作展现城市历史与风貌的高质量视频内容，助力文旅 IP 传播。",
                image: "/images/55.png"
              },
              {
                client: "K11 Select",
                project: "商业地产气味雕塑",
                category: "实体公共艺术",
                desc: "为 K11 跬步计划设计并落地《焱泠》交互气味雕塑，结合物理材料与程序控制，提升商业空间艺术氛围。",
                image: "/images/66.png"
              },
              {
                client: "合成生物研究所",
                project: "气味交互艺术展",
                category: "气味与科技艺术",
                desc: "将合成生物学概念转化为《地球蓝得像个橘子》交互装置，通过嗅觉与视觉的跨界结合实现科学概念的艺术表达。",
                image: "/images/77.png"
              },
              {
                client: "非物质文化遗产",
                project: "杨柳青与红楼梦数字焕新",
                category: "文化 IP 数字化",
                desc: "提取传统经典视觉特征，定向炼制专属 AIGC 图像生成模型，实现非物质文化遗产的当代数字视觉重构与跨媒介传播。",
                image: "/images/99.png"
              },
              {
                client: "普达措国家公园",
                project: "首届生态艺术季",
                category: "展览策划与驻地",
                desc: "策划并执行大型自然生态公共艺术季，在自然林木间构建在地可持续装置，打造自然与人文对话的疗愈展览场域。",
                image: "/images/88.png"
              },
              {
                client: "深圳南头古城",
                project: "《桃源秘境》商业展",
                category: "在地公共艺术装置",
                desc: "策划并落地结合藏南民艺与岭南元素的沉浸式商业文化展览，将大地叙事转化为可体验的户外探索产品与空间陈设。",
                image: "/images/100.png"
              }
            ].map((work, idx) => (
              <TiltWrapper 
                key={idx}
                delay={idx * 0.1}
                className="group relative h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 p-4 md:p-6 flex flex-col justify-end"
              >
                {/* 案例图片 */}
                <Image 
                  src={work.image} 
                  alt={work.project} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-100" 
                />
                
                {/* 悬停时的微光效果 (代表灵感/AIGC) */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay z-10" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10 group-hover:from-black/100 group-hover:via-black/70 transition-colors duration-300" />
                
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
      <section id="awards" className="py-20 md:py-32 px-4 sm:px-8 md:px-12 bg-zinc-950 border-t border-zinc-900">
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
                className="group p-5 md:p-6 bg-black border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors flex flex-col h-full"
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
      <section id="research" className="py-20 md:py-32 px-4 sm:px-8 md:px-12 bg-black border-t border-zinc-900">
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
                image: "/images/aa.jpg"
              },
              {
                year: "2025",
                title: "第十届网络社会年会青年学者论坛",
                desc: "参与网络社会语境下的青年学术论坛交流，持续推进数字影像、算法文化与网络社会研究的交叉讨论。",
                image: "/images/bb.jpg"
              },
              {
                year: "2025",
                title: "新媒体与非物质文化遗产传承创新学术论坛",
                desc: "参与中央民族大学相关学术论坛交流，围绕新媒体语境下的非物质文化遗产传承、创新转化与数字传播展开讨论。",
                image: "/images/cc.jpg"
              },
              {
                year: "2025",
                title: "国家艺术基金沉浸式交互动漫人工智能创作人才培养资助项目",
                desc: "参与国家艺术基金人才培养项目，由中国动漫集团发起，聚焦沉浸式交互、动漫叙事与人工智能创作方法。",
                image: "/images/dd.jpeg"
              },
              {
                year: "2023",
                title: "国家艺术基金数字博物馆数字艺术人才培训资助项目",
                desc: "参与国家艺术基金数字艺术人才培训项目，由文化和旅游部艺术发展中心发起，聚焦数字博物馆与数字艺术方法。",
                image: "/images/ee.jpg"
              },
              {
                year: "2022-2024",
                title: "科研项目与教学研究",
                desc: "主持并参与天津市科研创新项目，包括《基于人机交互技术的 OMO 智慧教学应用模式研究》与《三维游戏“一公米线上实体店”建设研究项目》等。",
                image: "/images/ff.png"
              }
            ].map((item, idx) => (
              <TiltWrapper
                key={idx}
                delay={idx * 0.05}
                className="group relative min-h-[250px] md:min-h-[300px] p-5 md:p-6 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors flex flex-col justify-between overflow-hidden"
              >
                {/* 背景图片 */}
                <Image 
                  src={item.image} 
                  alt={item.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-40 group-hover:opacity-80" 
                />
                
                {/* 悬停时的微光效果 */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay z-10" />

                {/* 均衡的全覆盖半透明黑色暗层：调整默认透明度为 45%，悬停时变亮为 25% */}
                <div className="absolute inset-0 bg-black/45 group-hover:bg-black/25 transition-colors duration-500 z-10" />

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
      <section id="team" className="py-20 md:py-32 px-4 sm:px-8 md:px-12 bg-black border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight mb-10 md:mb-16 text-left md:text-center">团队成员</h2>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
            <TiltWrapper delay={0.1} className="bg-black p-6 sm:p-8 md:p-10 rounded-xl border border-zinc-800 h-full">
              <div className="flex items-center gap-4 mb-6" style={{ transform: "translateZ(30px)" }}>
                <div className="relative shrink-0 aspect-square w-16 md:w-20 rounded-full overflow-hidden border border-zinc-700">
                  <Image src="/images/rxq.jpg" alt="任玄奇" fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-1">任玄奇</h3>
                  <p className="text-zinc-400 text-sm md:text-base">影像导演 / 跨媒体艺术硕士</p>
                </div>
              </div>
              
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-6" style={{ transform: "translateZ(20px)" }}>
                具备丰富的数字影像、AIGC 与数字技术开发经验，致力于将视觉研究转化为可落地的商业展示与数字平台。同时担任人工智能艺术高研班及艺术创作导师。
              </p>
              <div className="text-xs md:text-sm text-zinc-500 space-y-1.5" style={{ transform: "translateZ(10px)" }}>
                <p>参与展览：全国美术作品展览、中国数字艺术大展、北京国际电影节等</p>
                <p>教学经历：天津美术学院人工智能艺术通识课、天津美术学院人工智能艺术高研班</p>
              </div>
            </TiltWrapper>

            <TiltWrapper delay={0.2} className="bg-black p-6 sm:p-8 md:p-10 rounded-xl border border-zinc-800 h-full">
              <div className="flex items-center gap-4 mb-6" style={{ transform: "translateZ(30px)" }}>
                <div className="relative shrink-0 aspect-square w-16 md:w-20 rounded-full overflow-hidden border border-zinc-700">
                  <Image src="/images/wyf.jpg" alt="吴于枫" fill className="object-cover scale-[1.25] origin-top translate-x-2 -translate-y-2" />
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

            <TiltWrapper delay={0.3} className="bg-black p-6 sm:p-8 md:p-10 rounded-xl border border-zinc-800 h-full">
              <div className="flex items-center gap-4 mb-6" style={{ transform: "translateZ(30px)" }}>
                <div className="relative shrink-0 aspect-square w-16 md:w-20 rounded-full overflow-hidden border border-zinc-700 bg-zinc-900 flex items-center justify-center">
                  <Image src="/images/zsm.png" alt="章斯敏" fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-1">章斯敏</h3>
                  <p className="text-zinc-400 text-sm md:text-base">艺术研究者 / 数字媒体艺术硕士</p>
                </div>
              </div>

              <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-6" style={{ transform: "translateZ(20px)" }}>
                研究方向偏向中国传统文化数字化再现与跨媒介叙事，兼具艺术学、古文化艺术，关注虚拟身份、数据叙事与 AIGC 融合研究。
              </p>
              <div className="text-xs md:text-sm text-zinc-500 space-y-1.5" style={{ transform: "translateZ(10px)" }}>
    
                <p>实践方向：交互装置、实验影像、交互影像、生成艺术</p>
              </div>
            </TiltWrapper>
          </div>
        </div>
      </section>

      {/* 联系我们 Contact Section */}
      <section id="contact" className="py-20 md:py-32 px-4 sm:px-8 md:px-12 bg-black flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-6">项目洽谈与合作</h2>
        <p className="text-zinc-400 text-sm md:text-base mb-12 md:mb-16 max-w-lg mx-auto px-4">
          欢迎与我们取得联系，了解更多案例细节或探讨具体的合作需求。
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">
          {/* 微信二维码 */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-black rounded-xl flex items-center justify-center mb-4 overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-colors p-3">
              <div className="relative w-full h-full scale-[1.2] -translate-y-1">
                <Image 
                  src="/images/qrcode_dark.jpg" 
                  alt="微信二维码" 
                  fill 
                  className="object-contain mix-blend-screen opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
            <span className="text-zinc-300 font-medium">扫码添加微信</span>
            <span className="text-zinc-500 text-sm mt-1">Feuille_1100</span>
          </div>
          
          {/* 分割线 */}
          <div className="h-px w-32 md:w-px md:h-32 bg-zinc-800"></div>
          
          {/* 邮箱联系 */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-black border border-zinc-800 rounded-full flex items-center justify-center mb-4 hover:border-zinc-600 transition-colors">
              <Mail className="w-10 h-10 text-zinc-500" />
            </div>
            <a href="mailto:feuillefeng@foxmail.com" className="text-zinc-300 font-medium hover:text-white transition-colors">发送邮件合作</a>
            <span className="text-zinc-500 text-sm mt-1">feuillefeng@foxmail.com</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-zinc-600 text-xs md:text-sm border-t border-zinc-900 bg-black">
        <p>© {new Date().getFullYear()} 液态像素工作室. 保留所有权利.</p>
      </footer>
    </main>
  );
}
