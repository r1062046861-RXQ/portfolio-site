"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export type PracticeWork = {
  id: string;
  client: string;
  project: string;
  category: string;
  desc: string;
  image: string;
  aspectClass: string;
  sizes: string;
  folioHref?: string;
  imgPosition?: string;
};

const WORKS_MAP: Record<string, PracticeWork> = {
  pudacuo: {
    id: "pudacuo",
    client: "普达措国家公园",
    project: "首届生态艺术季",
    category: "展览策划与驻地",
    desc: "策划并执行大型自然生态公共艺术季，在自然林木间构建在地可持续装置，打造自然与人文对话的疗愈展览场域。",
    image: "/images/88.webp",
    aspectClass: "aspect-[16/9]",
    sizes: "(max-width: 1024px) 100vw, 62vw",
  },
  k11: {
    id: "k11",
    client: "K11 Select",
    project: "商业地产气味雕塑",
    category: "实体公共艺术",
    desc: "为 K11 跬步计划设计并落地《焱泠》交互气味雕塑，结合物理材料与程序控制，提升商业空间艺术氛围。",
    image: "/images/66.webp",
    aspectClass: "aspect-[3/4]",
    sizes: "(max-width: 1024px) 100vw, 30vw",
  },
  syntheticBio: {
    id: "syntheticBio",
    client: "合成生物研究所",
    project: "气味交互艺术展",
    category: "气味与科技艺术",
    desc: "将合成生物学概念转化为《地球蓝得像个橘子》交互装置，通过嗅觉与视觉的跨界结合实现科学概念的艺术表达。",
    image: "/images/77.webp",
    aspectClass: "aspect-[3/4]",
    sizes: "(max-width: 1024px) 100vw, 38vw",
  },
  jiading: {
    id: "jiading",
    client: "上海嘉定文旅",
    project: "城市文旅数字影像",
    category: "文化展示",
    desc: "运用数字特效与风格化转绘，制作展现城市历史与风貌的高质量视频内容，助力文旅 IP 传播。",
    image: "/images/55.webp",
    aspectClass: "aspect-[16/10]",
    sizes: "(max-width: 1024px) 100vw, 48vw",
    folioHref: "/portfolio/16-jiading-wonder-trip/",
  },
  scienceMuseum: {
    id: "scienceMuseum",
    client: "中国科学技术馆",
    project: "音乐可视化项目",
    category: "场馆展示",
    desc: "制作光影与音律结合的动态视觉，应用于场馆的科学与艺术传播活动。",
    image: "/images/44.webp",
    aspectClass: "aspect-square",
    sizes: "(max-width: 1024px) 100vw, 45vw",
    folioHref: "/portfolio/12-china-science-museum/",
  },
  kuaishou: {
    id: "kuaishou",
    client: "快手磁力引擎",
    project: "年度宣传影像",
    category: "视觉创意",
    desc: "结合图像拼贴与动态视频技术，为平台活动制作宣传影像。",
    image: "/images/33.webp",
    aspectClass: "aspect-square",
    sizes: "(max-width: 1024px) 100vw, 38vw",
    folioHref: "/portfolio/17-kuaishou-2025/",
  },
  yangliuqing: {
    id: "yangliuqing",
    client: "非物质文化遗产",
    project: "杨柳青与红楼梦数字焕新",
    category: "文化 IP 数字化",
    desc: "提取传统经典视觉特征，定向炼制专属 AIGC 图像生成模型，实现非物质文化遗产的当代数字视觉重构与跨媒介传播。",
    image: "/images/99.webp",
    aspectClass: "aspect-[4/5]",
    sizes: "(max-width: 1024px) 100vw, 32vw",
    folioHref: "/portfolio/10-yangliuqing-aigc/",
  },
  nantou: {
    id: "nantou",
    client: "深圳南头古城",
    project: "《桃源秘境》商业展",
    category: "在地公共艺术装置",
    desc: "策划并落地结合藏南民艺与岭南元素的沉浸式商业文化展览，将大地叙事转化为可体验的户外探索产品与空间陈设。",
    image: "/images/100.webp",
    aspectClass: "aspect-[16/9]",
    sizes: "(max-width: 1024px) 100vw, 54vw",
  },
  tafaAi: {
    id: "tafaAi",
    client: "天津美术学院",
    project: "AI 艺术高研班",
    category: "教学与培训",
    desc: "担任人工智能艺术高级研修班艺术创作教师，指导学员开展多模态工作流搭建、定制模型训练及 AI 影像创作。",
    image: "/images/22.webp",
    aspectClass: "aspect-[4/3]",
    sizes: "(max-width: 1024px) 100vw, 26vw",
  },
  tafaWorkshop: {
    id: "tafaWorkshop",
    client: "天津美术学院 & 天津青年宫",
    project: "社会美育与疗愈工作坊",
    category: "艺术工作坊",
    desc: "策划并落地社会参与性艺术活动，在公共空间中唤起个体的审美感知，将艺术创意与情感疗愈深度结合。",
    image: "/images/11.webp",
    aspectClass: "aspect-[4/3]",
    sizes: "(max-width: 1024px) 100vw, 26vw",
  },
};

function CuratedPlate({
  work,
  className = "",
}: {
  work: PracticeWork;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.article
      initial={prefersReduced ? false : { opacity: 0.92, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.04 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`site-plate-card group flex flex-col ${className}`}
    >
      <div className={`cinema-optical-frame relative w-full ${work.aspectClass} overflow-hidden bg-[#0e0e12]`}>
        <Image
          src={work.image}
          alt={`${work.client} · ${work.project}`}
          fill
          sizes={work.sizes}
          className={`cinema-plate-img object-cover ${work.imgPosition ?? "object-center"}`}
        />
      </div>

      <div className="pt-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3 text-xs font-mono tracking-[0.12em] text-[#9398a3]">
          <span>{work.category}</span>
          {work.folioHref && (
            <Link
              href={work.folioHref}
              prefetch={false}
              className="inline-flex items-center gap-1 text-[#f5f6f8] hover:text-[#c4c7ce] transition-colors"
            >
              <span>作品集档案</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>

        <h3 className="text-lg sm:text-xl font-medium tracking-[-0.015em] text-[#f5f6f8] leading-snug">
          {work.client}
          <span className="text-[#c4c7ce] font-normal ml-2">{work.project}</span>
        </h3>

        <p className="text-sm leading-relaxed text-[#c4c7ce] mt-0.5 max-w-xl">
          {work.desc}
        </p>
      </div>
    </motion.article>
  );
}

export default function CuratedWorksShowcase() {
  return (
    <section id="works" className="site-section py-24 md:py-36 px-5 sm:px-8 md:px-12 bg-[#050506]">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.025em] text-[#f5f6f8]">
            创作、影像与新媒体实践
          </h2>
          <p className="text-[#c4c7ce] text-sm sm:text-base max-w-md leading-relaxed">
            2022–2026，从影像、展览、交互装置到公共艺术，持续把创意、协作与技术落实到真实项目中。
          </p>
        </div>

        <div className="h-px w-full bg-white/10 mt-10 mb-16 md:mb-24" aria-hidden="true" />

        <div className="space-y-24 md:space-y-36">
          {/* 第一幕：生态银幕全景 × 悬垂气味雕塑（尺幅强烈对比） */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <CuratedPlate work={WORKS_MAP.pudacuo} className="lg:col-span-8" />
            <CuratedPlate work={WORKS_MAP.k11} className="lg:col-span-4 lg:mt-36" />
          </div>

          {/* 第二幕：生物交互玻璃装置 × 城市文旅转绘影像 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <CuratedPlate work={WORKS_MAP.syntheticBio} className="lg:col-span-5 lg:mt-20" />
            <CuratedPlate work={WORKS_MAP.jiading} className="lg:col-span-6 lg:col-start-7" />
          </div>

          {/* 第三幕：跨媒介方构图视觉工程（错位悬停张力） */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <CuratedPlate work={WORKS_MAP.scienceMuseum} className="lg:col-span-6" />
            <CuratedPlate work={WORKS_MAP.kuaishou} className="lg:col-span-5 lg:col-start-8 lg:mt-28" />
          </div>

          {/* 第四幕：非遗 AIGC 竖幅 × 商业空间与美育现场双联 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <CuratedPlate work={WORKS_MAP.yangliuqing} className="lg:col-span-4" />
            <div className="lg:col-span-7 lg:col-start-6 space-y-16 md:space-y-20">
              <CuratedPlate work={WORKS_MAP.nantou} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                <CuratedPlate work={WORKS_MAP.tafaAi} />
                <CuratedPlate work={WORKS_MAP.tafaWorkshop} className="md:mt-14" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
