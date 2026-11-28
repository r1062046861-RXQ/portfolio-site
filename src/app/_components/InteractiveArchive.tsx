"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type ArchiveKind = "award" | "research";

type ArchiveEntry = {
  id: string;
  kind: ArchiveKind;
  year: string;
  title: string;
  tag: string;
  desc: string;
  image: string;
};

const ARCHIVE_ENTRIES: ArchiveEntry[] = [
  {
    id: "bjiff-2026",
    kind: "award",
    year: "2026",
    title: "第十六届北京国际电影节",
    tag: "无界∞沉浸单元 / 国际A类电影节",
    desc: "受邀参展第十六届北京国际电影节无界∞沉浸单元，以实时影像与空间交互探讨数字媒介感知边界。",
    image: "/portfolio-2025/meta/cover-fluid.webp",
  },
  {
    id: "hainan-2025",
    kind: "award",
    year: "2025",
    title: "第七届海南岛国际电影节",
    tag: "未来影像展 / 国际电影节",
    desc: "作品入围第七届海南岛国际电影节未来影像展映单元，展现人工智能与实验影像语言的跨媒介融合。",
    image: "/images/55.webp",
  },
  {
    id: "qingdao-2025",
    kind: "award",
    year: "2025",
    title: "第七届青岛国际双年展",
    tag: "大型国际当代艺术双年展",
    desc: "受邀参展第七届青岛国际双年展，在公共展陈语境中构建多感官交互与科技艺术现场。",
    image: "/images/66.webp",
  },
  {
    id: "pudacuo-2025",
    kind: "award",
    year: "2025",
    title: "普达措生态艺术季",
    tag: "国家公园 / 大型自然生态公共艺术展",
    desc: "于高原国家公园林木间策划并落地生态公共艺术现场装置，建立自然空间与当代艺术感知的对话。",
    image: "/images/88.webp",
  },
  {
    id: "ccf-2025",
    kind: "award",
    year: "2025",
    title: "CCF 计算艺术大展",
    tag: "中国计算机学会 / 顶尖学术科技跨界展",
    desc: "亮相中国计算机学会计算艺术大展，呈现算法生成系统、声画实时计算与视觉工程交叉实践。",
    image: "/images/44.webp",
  },
  {
    id: "national-14-2024",
    kind: "award",
    year: "2024",
    title: "第十四届全国美术作品展览",
    tag: "实验艺术、数字艺术与动画展区 / 国家级最高展",
    desc: "入选五年一届的国家级最高美术展览实验艺术、数字艺术与动画展区，完成高规格当代视觉学术呈现。",
    image: "/images/99.webp",
  },
  {
    id: "digital-art-2024",
    kind: "award",
    year: "2024",
    title: "首届中国数字艺术大展",
    tag: "中国美术馆 / 国家级数字艺术大展",
    desc: "参展于中国美术馆举办的首届中国数字艺术大展，聚焦生成艺术、媒介考古与当代数字图像建构。",
    image: "/images/aa.webp",
  },
  {
    id: "siat-2024",
    kind: "award",
    year: "2024",
    title: "深圳先进院合成生物研究所艺术展",
    tag: "跨界科技艺术展 / 深圳",
    desc: "将前沿合成生物学观念转译为嗅觉与视觉联动的实体机械交互装置《地球蓝得像个橘子》。",
    image: "/images/77.webp",
  },
  {
    id: "forum-bjiff-2025",
    kind: "research",
    year: "2025",
    title: "第十四届北京国际电影节第六届国际青年学者论坛",
    tag: "学术论坛发言",
    desc: "围绕影像研究、当代艺术与技术方法参与国际青年学术交流，拓展电影节语境下的跨学科讨论。",
    image: "/images/aa.webp",
  },
  {
    id: "forum-nsac-2025",
    kind: "research",
    year: "2025",
    title: "第十届网络社会年会青年学者论坛",
    tag: "青年学者论坛",
    desc: "参与网络社会语境下的青年学术论坛交流，持续推进数字影像、算法文化与网络社会研究的交叉讨论。",
    image: "/images/bb.webp",
  },
  {
    id: "forum-muc-2025",
    kind: "research",
    year: "2025",
    title: "新媒体与非物质文化遗产传承创新学术论坛",
    tag: "中央民族大学 · 学术交流",
    desc: "参与中央民族大学相关学术论坛交流，围绕新媒体语境下的非物质文化遗产传承、创新转化与数字传播展开讨论。",
    image: "/images/cc.webp",
  },
  {
    id: "naf-2025",
    kind: "research",
    year: "2025",
    title: "国家艺术基金沉浸式交互动漫人工智能创作人才培养资助项目",
    tag: "国家艺术基金",
    desc: "参与国家艺术基金人才培养项目，由中国动漫集团发起，聚焦沉浸式交互、动漫叙事与人工智能创作方法。",
    image: "/images/dd.webp",
  },
  {
    id: "naf-2023",
    kind: "research",
    year: "2023",
    title: "国家艺术基金数字博物馆数字艺术人才培训资助项目",
    tag: "国家艺术基金",
    desc: "参与国家艺术基金数字艺术人才培训项目，由文化和旅游部艺术发展中心发起，聚焦数字博物馆展陈、三维空间视觉开发与区块链研究。",
    image: "/images/ee.webp",
  },
  {
    id: "research-2022",
    kind: "research",
    year: "2022–2024",
    title: "科研项目与教学研究",
    tag: "省部级科研课题",
    desc: "主持并参与天津市科研创新项目，包括《基于人机交互技术的 OMO 智慧教学应用模式研究》与《三维游戏“一公米线上实体店”建设研究项目》等。",
    image: "/images/ff.webp",
  },
];

type FilterTab = "all" | ArchiveKind;

export default function InteractiveArchive() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [activeId, setActiveId] = useState<string>(ARCHIVE_ENTRIES[3].id);

  // 预加载全部档案缩略图，避免桌面端悬停与移动端点击展开时出现短瞬黑场闪烁
  useEffect(() => {
    const uniqueSrcs = Array.from(new Set(ARCHIVE_ENTRIES.map((e) => e.image)));
    uniqueSrcs.forEach((src) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
    });
  }, []);

  const awardEntries = useMemo(
    () => ARCHIVE_ENTRIES.filter((entry) => entry.kind === "award"),
    []
  );
  const researchEntries = useMemo(
    () => ARCHIVE_ENTRIES.filter((entry) => entry.kind === "research"),
    []
  );

  const visibleEntries = useMemo(() => {
    if (filter === "all") return ARCHIVE_ENTRIES;
    return filter === "award" ? awardEntries : researchEntries;
  }, [filter, awardEntries, researchEntries]);

  const currentEntry =
    visibleEntries.find((entry) => entry.id === activeId) ?? visibleEntries[0];

  const handleFilterChange = (nextFilter: FilterTab) => {
    setFilter(nextFilter);
    const nextList =
      nextFilter === "all"
        ? ARCHIVE_ENTRIES
        : nextFilter === "award"
          ? awardEntries
          : researchEntries;
    if (nextList.length > 0 && !nextList.some((entry) => entry.id === activeId)) {
      setActiveId(nextList[0].id);
    }
  };

  const renderEntryRow = (entry: ArchiveEntry) => {
    const isActive = currentEntry?.id === entry.id;
    return (
      <div key={entry.id} className="site-print-avoid">
        <div className="h-px w-full bg-white/10" aria-hidden="true" />
        <button
          type="button"
          onMouseEnter={() => setActiveId(entry.id)}
          onFocus={() => setActiveId(entry.id)}
          onClick={() => setActiveId(entry.id)}
          aria-expanded={isActive}
          className="w-full text-left py-5 flex items-baseline justify-between gap-4 sm:gap-6 group transition-colors"
        >
          <div className="flex items-baseline gap-4 sm:gap-7 min-w-0">
            <span
              className={`shrink-0 w-20 sm:w-24 font-mono text-xs sm:text-sm tabular-nums transition-colors ${
                isActive ? "text-[#f5f6f8]" : "text-[#9398a3] group-hover:text-[#c4c7ce]"
              }`}
            >
              {entry.year}
            </span>
            <span
              className={`text-base sm:text-lg font-medium leading-snug transition-colors ${
                isActive ? "text-[#f5f6f8]" : "text-[#c4c7ce] group-hover:text-[#f5f6f8]"
              }`}
            >
              {entry.title}
            </span>
          </div>

          <span className="shrink-0 hidden sm:inline text-xs font-mono text-[#9398a3]">
            {entry.kind === "award" ? "展览与荣誉" : "学术成果"}
          </span>
        </button>

        {/* 移动端内联手风琴预览 */}
        {isActive && (
          <div className="lg:hidden pb-6 space-y-4">
            <div className="cinema-chromatic-preview relative w-full aspect-[16/10] overflow-hidden bg-[#0e0e12]">
              <Image
                src={entry.image}
                alt={entry.title}
                fill
                loading="eager"
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-mono text-[#9398a3] mb-1.5">{entry.tag}</div>
              <p className="text-sm leading-relaxed text-[#c4c7ce]">{entry.desc}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section
      id="awards"
      className="site-section relative py-24 md:py-36 px-5 sm:px-8 md:px-12 bg-[#050506]"
    >
      <span id="research" className="block -mt-20 pt-20" aria-hidden="true" />
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.025em] text-[#f5f6f8]">
            展览荣誉与学术成果
          </h2>

          <div
            className="flex flex-wrap items-center gap-6 text-sm"
            role="tablist"
            aria-label="档案分类筛选"
          >
            {[
              { id: "all" as const, label: "全部档案", count: ARCHIVE_ENTRIES.length },
              {
                id: "award" as const,
                label: "展览与荣誉",
                count: awardEntries.length,
              },
              {
                id: "research" as const,
                label: "学术成果",
                count: researchEntries.length,
              },
            ].map((tab) => {
              const selected = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => handleFilterChange(tab.id)}
                  className={`pb-2 transition-colors ${
                    selected
                      ? "text-[#f5f6f8] font-medium"
                      : "text-[#9398a3] hover:text-[#c4c7ce]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="ml-1.5 font-mono text-xs tabular-nums">({tab.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px w-full bg-white/10 mt-8 mb-12 md:mb-16" aria-hidden="true" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* 左侧：按「展览与荣誉」「学术成果」清晰分段的编年目录 */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between pb-4 text-[11px] font-mono tracking-[0.16em] text-[#9398a3]">
              <span>年份 / 档案条目</span>
              <span className="hidden sm:inline">悬停或点击预览现场影像</span>
            </div>

            {filter === "all" ? (
              <div>
                <div className="pt-2 pb-3 text-xs font-mono tracking-[0.1em] text-[#9398a3]">
                  展览与荣誉 · 2026–2024
                </div>
                {awardEntries.map(renderEntryRow)}
                <div className="h-px w-full bg-white/10" aria-hidden="true" />

                <div className="pt-10 pb-3 text-xs font-mono tracking-[0.1em] text-[#9398a3]">
                  学术成果 · 2025–2022
                </div>
                {researchEntries.map(renderEntryRow)}
                <div className="h-px w-full bg-white/10" aria-hidden="true" />
              </div>
            ) : (
              <div>
                {visibleEntries.map(renderEntryRow)}
                <div className="h-px w-full bg-white/10" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* 右侧：桌面端粘性光学暗房预览浮窗 */}
          <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-28">
            {currentEntry && (
              <div className="space-y-5">
                <div className="cinema-chromatic-preview relative w-full aspect-[16/10] overflow-hidden bg-[#0e0e12]">
                  <Image
                    src={currentEntry.image}
                    alt={currentEntry.title}
                    fill
                    loading="eager"
                    sizes="(max-width: 1280px) 42vw, 540px"
                    className="object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4 text-xs font-mono tracking-[0.1em] text-[#9398a3] mb-2">
                    <span>{currentEntry.tag}</span>
                    <span className="tabular-nums text-[#f5f6f8]">{currentEntry.year}</span>
                  </div>
                  <h3 className="text-xl font-medium tracking-[-0.015em] text-[#f5f6f8] mb-2">
                    {currentEntry.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#c4c7ce]">{currentEntry.desc}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
