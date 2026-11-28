import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Mail } from "lucide-react";

type ServiceBranch = {
  code: string;
  audience: string;
  title: string;
  desc: string;
  accentLabelClass: string;
  steps: {
    no: string;
    title: string;
    desc: string;
    tags: string[];
  }[];
};

type PracticeWork = {
  client: string;
  project: string;
  category: string;
  desc: string;
  image: string;
  ratioClass: string;
  folioHref?: string;
  imgPosition?: string;
};

const SERVICE_BRANCHES: ServiceBranch[] = [
  {
    code: "01",
    audience: "给企业团队",
    title: "把重复的工作，变成更顺手的做法",
    desc: "围绕真实工作流程，留下能复用的操作步骤、模板和检查清单。",
    accentLabelClass: "text-[#e2785c]",
    steps: [
      {
        no: "01",
        title: "先找出最费时间的事",
        desc: "一起看看哪些事情总在重复、容易卡住或花很久时间，优先从最值得改善的地方开始。",
        tags: ["找问题", "排先后", "用得放心"],
      },
      {
        no: "02",
        title: "用自己的工作来练",
        desc: "拿正在做的材料、项目和沟通任务一起练，把新的做法变成团队日常能用的流程。",
        tags: ["边做边学", "当天能用", "团队一起练"],
      },
    ],
  },
  {
    code: "02",
    audience: "给艺术家与创作团队",
    title: "把创作想法，推进到可以呈现的样子",
    desc: "围绕新媒体、交互、影像与影视制作，提供从测试到呈现的技术协作。",
    accentLabelClass: "text-[#e2785c]",
    steps: [
      {
        no: "01",
        title: "先把想法做成能看到的样子",
        desc: "先制作能讨论的视觉测试、技术样机或短段落，再决定下一步怎么走。",
        tags: ["视觉测试", "技术样机", "创作讨论"],
      },
      {
        no: "02",
        title: "从样机到展映一起把关",
        desc: "根据展示场地、叙事需要和制作条件，梳理技术路线，让作品走向展览、展映或现场呈现。",
        tags: ["新媒体技术", "影像制作", "现场呈现"],
      },
    ],
  },
];

const WORKS_BAND_FEATURED: PracticeWork[] = [
  {
    client: "普达措国家公园",
    project: "首届生态艺术季",
    category: "展览策划与驻地",
    desc: "策划并执行大型自然生态公共艺术季，在自然林木间构建在地可持续装置，打造自然与人文对话的疗愈展览场域。",
    image: "/images/88.webp",
    ratioClass: "aspect-[16/10]",
  },
  {
    client: "上海嘉定文旅",
    project: "城市文旅数字影像",
    category: "文化展示",
    desc: "运用数字特效与风格化转绘，制作展现城市历史与风貌的高质量视频内容，助力文旅 IP 传播。",
    image: "/images/55.webp",
    ratioClass: "aspect-[16/10]",
    folioHref: "/portfolio/16-jiading-wonder-trip/",
  },
];

const WORKS_BAND_EXHIBITS: PracticeWork[] = [
  {
    client: "合成生物研究所",
    project: "气味交互艺术展",
    category: "气味与科技艺术",
    desc: "将合成生物学概念转化为《地球蓝得像个橘子》交互装置，通过嗅觉与视觉的跨界结合实现科学概念的艺术表达。",
    image: "/images/77.webp",
    ratioClass: "aspect-[4/5]",
  },
  {
    client: "K11 Select",
    project: "商业地产气味雕塑",
    category: "实体公共艺术",
    desc: "为 K11 跬步计划设计并落地《焱泠》交互气味雕塑，结合物理材料与程序控制，提升商业空间艺术氛围。",
    image: "/images/66.webp",
    ratioClass: "aspect-[4/5]",
  },
  {
    client: "非物质文化遗产",
    project: "杨柳青与红楼梦数字焕新",
    category: "文化 IP 数字化",
    desc: "提取传统经典视觉特征，定向炼制专属 AIGC 图像生成模型，实现非物质文化遗产的当代数字视觉重构与跨媒介传播。",
    image: "/images/99.webp",
    ratioClass: "aspect-[4/5]",
    folioHref: "/portfolio/10-yangliuqing-aigc/",
  },
];

const WORKS_BAND_VISUALS: PracticeWork[] = [
  {
    client: "中国科学技术馆",
    project: "音乐可视化项目",
    category: "场馆展示",
    desc: "制作光影与音律结合的动态视觉，应用于场馆的科学与艺术传播活动。",
    image: "/images/44.webp",
    ratioClass: "aspect-square",
    folioHref: "/portfolio/12-china-science-museum/",
  },
  {
    client: "快手磁力引擎",
    project: "年度宣传影像",
    category: "视觉创意",
    desc: "结合图像拼贴与动态视频技术，为平台活动制作宣传影像。",
    image: "/images/33.webp",
    ratioClass: "aspect-square",
    folioHref: "/portfolio/17-kuaishou-2025/",
  },
];

const WORKS_BAND_FIELD: PracticeWork[] = [
  {
    client: "深圳南头古城",
    project: "《桃源秘境》商业展",
    category: "在地公共艺术装置",
    desc: "策划并落地结合藏南民艺与岭南元素的沉浸式商业文化展览，将大地叙事转化为可体验的户外探索产品与空间陈设。",
    image: "/images/100.webp",
    ratioClass: "aspect-[3/2]",
  },
  {
    client: "天津美术学院",
    project: "AI 艺术高研班",
    category: "教学与培训",
    desc: "担任人工智能艺术高级研修班艺术创作教师，指导学员开展多模态工作流搭建、定制模型训练及 AI 影像创作。",
    image: "/images/22.webp",
    ratioClass: "aspect-[3/2]",
  },
  {
    client: "天津美术学院 & 天津青年宫",
    project: "社会美育与疗愈工作坊",
    category: "艺术工作坊",
    desc: "策划并落地社会参与性艺术活动，在公共空间中唤起个体的审美感知，将艺术创意与情感疗愈深度结合。",
    image: "/images/11.webp",
    ratioClass: "aspect-[3/2]",
  },
];

const AWARDS = [
  { year: "2026", title: "第十六届北京国际电影节", desc: "无界∞沉浸单元 / 国际A类电影节" },
  { year: "2025", title: "第七届海南岛国际电影节", desc: "未来影像展 / 国际电影节" },
  { year: "2025", title: "第七届青岛国际双年展", desc: "大型国际当代艺术双年展" },
  { year: "2025", title: "普达措生态艺术季", desc: "国家公园 / 大型自然生态公共艺术展" },
  { year: "2025", title: "CCF 计算艺术大展", desc: "中国计算机学会 / 顶尖学术科技跨界展" },
  { year: "2024", title: "第十四届全国美术作品展览", desc: "实验艺术、数字艺术与动画展区 / 国家级最高展" },
  { year: "2024", title: "首届中国数字艺术大展", desc: "中国美术馆 / 国家级数字艺术大展" },
  { year: "2024", title: "深圳先进院合成生物研究所艺术展", desc: "跨界科技艺术展 / 深圳" },
];

const RESEARCH_ITEMS = [
  {
    year: "2025",
    title: "第十四届北京国际电影节第六届国际青年学者论坛",
    desc: "围绕影像研究、当代艺术与技术方法参与国际青年学术交流，拓展电影节语境下的跨学科讨论。",
    image: "/images/aa.webp",
  },
  {
    year: "2025",
    title: "第十届网络社会年会青年学者论坛",
    desc: "参与网络社会语境下的青年学术论坛交流，持续推进数字影像、算法文化与网络社会研究的交叉讨论。",
    image: "/images/bb.webp",
  },
  {
    year: "2025",
    title: "新媒体与非物质文化遗产传承创新学术论坛",
    desc: "参与中央民族大学相关学术论坛交流，围绕新媒体语境下的非物质文化遗产传承、创新转化与数字传播展开讨论。",
    image: "/images/cc.webp",
  },
  {
    year: "2025",
    title: "国家艺术基金沉浸式交互动漫人工智能创作人才培养资助项目",
    desc: "参与国家艺术基金人才培养项目，由中国动漫集团发起，聚焦沉浸式交互、动漫叙事与人工智能创作方法。",
    image: "/images/dd.webp",
  },
  {
    year: "2023",
    title: "国家艺术基金数字博物馆数字艺术人才培训资助项目",
    desc: "参与国家艺术基金数字艺术人才培训项目，由文化和旅游部艺术发展中心发起，聚焦数字博物馆展陈、三维空间视觉开发与区块链研究。",
    image: "/images/ee.webp",
  },
  {
    year: "2022–2024",
    title: "科研项目与教学研究",
    desc: "主持并参与天津市科研创新项目，包括《基于人机交互技术的 OMO 智慧教学应用模式研究》与《三维游戏“一公米线上实体店”建设研究项目》等。",
    image: "/images/ff.webp",
  },
];

function WorkPlate({ work, priority = false }: { work: PracticeWork; priority?: boolean }) {
  return (
    <article className="site-plate-card group flex flex-col">
      <div className={`relative w-full ${work.ratioClass} overflow-hidden bg-[#161614] border border-white/12`}>
        <Image
          src={work.image}
          alt={`${work.client} · ${work.project}`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
          className={`studio-plate-img object-cover ${work.imgPosition ?? "object-center"}`}
        />
      </div>

      <div className="pt-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3 text-xs font-mono tracking-[0.12em] text-[#9e988d]">
          <span>{work.category}</span>
          {work.folioHref && (
            <Link
              href={work.folioHref}
              prefetch={false}
              className="inline-flex items-center gap-1 text-[#e2785c] hover:text-[#f4f1ea] transition-colors"
            >
              <span>作品集档案</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>

        <h3 className="text-lg sm:text-xl font-medium tracking-tight text-[#f4f1ea] leading-snug">
          {work.client}
          <span className="text-[#b8b3a8] font-normal ml-2">{work.project}</span>
        </h3>

        <p className="text-sm leading-relaxed text-[#b8b3a8] mt-1">
          {work.desc}
        </p>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <div className="site-shell min-h-screen flex flex-col bg-[#0b0b0a] text-[#f4f1ea]">
      {/* 顶栏导航：克制单行秩序，兼顾移动端防折行 */}
      <header className="site-nav sticky top-0 z-50 bg-[#0b0b0a]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 h-16 flex items-center justify-between gap-4">
          <a href="#top" className="shrink-0 flex items-baseline gap-3">
            <span className="studio-serif text-base sm:text-lg font-semibold tracking-tight text-[#f4f1ea] whitespace-nowrap">
              液态像素艺术工作室
            </span>
            <span className="hidden lg:inline text-[11px] font-mono tracking-[0.2em] text-[#9e988d] uppercase">
              LIQUID PIXEL
            </span>
          </a>

          <nav aria-label="主导航" className="hidden md:flex items-center gap-7 text-sm text-[#d4cfc4]">
            <a href="#services" className="hover:text-[#f4f1ea] transition-colors whitespace-nowrap">
              合作方向
            </a>
            <a href="#works" className="hover:text-[#f4f1ea] transition-colors whitespace-nowrap">
              创作实践
            </a>
            <a href="#awards" className="hover:text-[#f4f1ea] transition-colors whitespace-nowrap">
              展览与学术
            </a>
            <a href="#team" className="hover:text-[#f4f1ea] transition-colors whitespace-nowrap">
              团队
            </a>
            <Link
              href="/portfolio/"
              prefetch={false}
              className="inline-flex items-center gap-1 text-[#f4f1ea] hover:text-[#e2785c] transition-colors whitespace-nowrap"
            >
              <span>任玄奇作品集</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </nav>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              href="/portfolio/"
              prefetch={false}
              className="md:hidden text-xs font-medium text-[#d4cfc4] hover:text-[#f4f1ea] whitespace-nowrap px-3 py-2 border border-white/20"
            >
              作品集
            </Link>
            <a
              href="#contact"
              className="px-4 py-2 text-xs sm:text-sm font-medium bg-white text-[#0b0b0a] hover:bg-[#e2785c] hover:text-[#0b0b0a] transition-colors whitespace-nowrap"
            >
              预约咨询
            </a>
          </div>
        </div>
        <div className="h-px w-full bg-white/10" aria-hidden="true" />
      </header>

      <main id="top" className="flex-1">
        {/* 首屏 Hero：12 栏非对称美术馆版式 + 真实实体/生态作品影像锚点 */}
        <section className="site-section site-hero relative overflow-hidden">
          {/* 极克制的液态轮廓质感纹理，替代传统 AI 渐变光球 */}
          <div data-print-hidden="true" className="pointer-events-none absolute inset-0 opacity-15">
            <Image
              src="/portfolio-2025/meta/cover-fluid.webp"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 72% 42%, transparent 0%, rgba(11,11,10,0.75) 55%, #0b0b0a 92%)",
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-14 md:py-20 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end">
              {/* 左侧主叙事栏 */}
              <div className="lg:col-span-7 studio-reveal">
                <h1 className="studio-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.12] text-[#f4f1ea] mb-5">
                  让技术真正服务于
                  <br />
                  工作与创作
                </h1>

                <p className="text-sm sm:text-base font-medium text-[#e2785c] mb-5">
                  面向企业团队、艺术家与创作机构
                </p>

                <p className="text-base sm:text-lg text-[#d4cfc4] max-w-2xl leading-[1.8] mb-9">
                  我们协助企业团队梳理重复工作、优化协作方式；也帮助艺术家和创作团队把新媒体、影像与影视创意发展为可讨论、可测试、可呈现的作品。
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-12">
                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center gap-2 bg-white text-[#0b0b0a] px-6 py-3.5 text-sm sm:text-base font-medium hover:bg-[#e2785c] transition-colors"
                  >
                    <span>聊聊你的项目</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>

                  <Link
                    href="/portfolio/"
                    prefetch={false}
                    className="inline-flex items-center justify-center gap-2 border border-white/25 text-[#f4f1ea] px-6 py-3.5 text-sm sm:text-base font-medium hover:border-[#f4f1ea] hover:bg-white/5 transition-colors"
                  >
                    <span>浏览任玄奇作品集</span>
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </Link>

                  <a
                    href="#services"
                    className="inline-flex items-center gap-1.5 text-sm text-[#b8b3a8] hover:text-[#f4f1ea] transition-colors px-2 py-2"
                  >
                    <span>看看我们能做什么</span>
                    <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>

                {/* 细线索引替代悬浮小标签胶囊 */}
                <div className="h-px w-full bg-white/15 mb-6" aria-hidden="true" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { tag: "流程重构", title: "让工作少绕弯", note: "真实流程重构与复用模板" },
                    { tag: "技术样机", title: "让创意能落地", note: "从视觉样机到展览呈现" },
                    { tag: "跨媒介制作", title: "新媒体与影视技术", note: "实时渲染 · AI 工作流 · 交互" },
                  ].map((item) => (
                    <div key={item.tag}>
                      <div className="text-xs font-mono text-[#e2785c] mb-1">{item.tag}</div>
                      <div className="text-sm font-medium text-[#f4f1ea]">{item.title}</div>
                      <div className="text-xs text-[#b8b3a8] mt-1">{item.note}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 右侧美术馆实景图版矩阵（保留完整主体不裁切） */}
              <div className="lg:col-span-5 studio-reveal-delay flex flex-col gap-3">
                <figure className="relative w-full aspect-[16/9] overflow-hidden bg-[#161614] border border-white/15">
                  <Image
                    src="/images/88.webp"
                    alt="普达措国家公园 · 首届生态艺术季现场装置"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover"
                  />
                </figure>

                <div className="grid grid-cols-2 gap-3">
                  <figure className="relative w-full aspect-[3/4] overflow-hidden bg-[#161614] border border-white/15">
                    <Image
                      src="/images/77.webp"
                      alt="合成生物研究所 · 气味交互艺术展装置"
                      fill
                      priority
                      sizes="(max-width: 1024px) 50vw, 20vw"
                      className="object-cover"
                    />
                  </figure>
                  <figure className="relative w-full aspect-[3/4] overflow-hidden bg-[#161614] border border-white/15">
                    <Image
                      src="/images/66.webp"
                      alt="K11 Select · 商业地产气味雕塑《焱泠》"
                      fill
                      priority
                      sizes="(max-width: 1024px) 50vw, 20vw"
                      className="object-cover"
                    />
                  </figure>
                </div>

                <figcaption className="flex items-center justify-between text-xs font-mono text-[#9e988d] pt-1">
                  <span>SELECTED INSTALLATIONS & PUBLIC ART</span>
                  <span>2022 — 2026</span>
                </figcaption>
              </div>
            </div>
          </div>
          <div className="h-px w-full bg-white/10" aria-hidden="true" />
        </section>

        {/* 合作方向 #services：两栏扁平建筑账本排布，零嵌套卡片 */}
        <section id="services" className="site-section py-20 md:py-28 px-5 sm:px-8 md:px-12 bg-[#111110]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
              <div className="lg:col-span-6">
                <p className="text-xs font-mono tracking-[0.2em] text-[#e2785c] mb-3">合作方向</p>
                <h2 className="studio-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#f4f1ea] leading-tight">
                  让工作顺畅，也让创作落地
                </h2>
              </div>
              <div className="lg:col-span-6">
                <p className="text-base md:text-lg leading-relaxed text-[#d4cfc4]">
                  我们从一件具体的事开始：企业团队里总在重复、卡住的工作，或艺术家与创作团队正在寻找技术路径的创作构想。一起找到合适做法，再把它落实为团队或作品可持续使用的成果。
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-white/12 mt-10 mb-14 md:mb-16" aria-hidden="true" />

            {/* 双栏宽松并列，彻底扁平化无挤压边框 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16">
              {SERVICE_BRANCHES.map((branch, branchIdx) => (
                <div key={branch.code}>
                  {branchIdx === 1 && (
                    <div className="h-px w-full bg-white/12 mb-10 lg:hidden" aria-hidden="true" />
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-mono tracking-[0.16em] ${branch.accentLabelClass}`}>
                      {branch.audience}
                    </span>
                    <span className="text-xs font-mono text-[#9e988d]">从一件具体的事开始</span>
                  </div>

                  <h3 className="studio-serif text-2xl sm:text-3xl font-semibold text-[#f4f1ea] mb-3 leading-snug">
                    {branch.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#b8b3a8] leading-relaxed mb-8">
                    {branch.desc}
                  </p>

                  <ol className="space-y-6">
                    {branch.steps.map((step) => (
                      <li key={step.no}>
                        <div className="h-px w-full bg-white/10 mb-6" aria-hidden="true" />
                        <div className="grid grid-cols-12 gap-4 items-start">
                          <span className="col-span-2 sm:col-span-1 text-xs font-mono text-[#e2785c] pt-1">
                            {step.no}
                          </span>
                          <div className="col-span-10 sm:col-span-11">
                            <h4 className="text-lg font-medium text-[#f4f1ea] mb-2">{step.title}</h4>
                            <p className="text-sm leading-relaxed text-[#b8b3a8] mb-3">{step.desc}</p>
                            <p className="text-xs font-mono tracking-[0.08em] text-[#9e988d]">
                              {step.tags.join("  ·  ")}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>

            <div className="h-px w-full bg-white/15 mt-14 mb-8" aria-hidden="true" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-sm md:text-base text-[#d4cfc4] max-w-3xl leading-relaxed">
                无论是一件总让团队费时间的工作，还是一个还没找到做法的创作想法，都可以从一件具体的事开始。
              </p>
              <a
                href="#contact"
                className="shrink-0 inline-flex items-center gap-2 text-sm font-medium text-[#f4f1ea] hover:text-[#e2785c] transition-colors"
              >
                <span>从一个具体问题开始</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-white/10" aria-hidden="true" />

        {/* 创作实践 #works：图在上 + 铭牌在下，4 组顺应原图纵横比的策展画廊排布 */}
        <section id="works" className="site-section py-20 md:py-28 px-5 sm:px-8 md:px-12 bg-[#0b0b0a]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-xs font-mono tracking-[0.2em] text-[#e2785c] mb-3">实践档案</p>
                <h2 className="studio-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#f4f1ea]">
                  创作、影像与新媒体实践
                </h2>
              </div>
              <p className="text-[#b8b3a8] text-sm md:text-base max-w-md leading-relaxed">
                从影像、展览、交互装置到公共艺术，持续把创意、协作与技术落实到真实项目中。
              </p>
            </div>

            <div className="h-px w-full bg-white/12 mt-8 mb-14" aria-hidden="true" />

            {/* 1. 大画幅横向双联 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
              {WORKS_BAND_FEATURED.map((work) => (
                <WorkPlate key={work.client + work.project} work={work} />
              ))}
            </div>

            <div className="h-px w-full bg-white/10 my-14" aria-hidden="true" />

            {/* 2. 三栏竖幅雕塑与公共展品 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {WORKS_BAND_EXHIBITS.map((work) => (
                <WorkPlate key={work.client + work.project} work={work} />
              ))}
            </div>

            <div className="h-px w-full bg-white/10 my-14" aria-hidden="true" />

            {/* 3. 双栏方构图跨媒介视觉工程 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {WORKS_BAND_VISUALS.map((work) => (
                <WorkPlate key={work.client + work.project} work={work} />
              ))}
            </div>

            <div className="h-px w-full bg-white/10 my-14" aria-hidden="true" />

            {/* 4. 三栏横向美育教学与商业展现场 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {WORKS_BAND_FIELD.map((work) => (
                <WorkPlate key={work.client + work.project} work={work} />
              ))}
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-white/10" aria-hidden="true" />

        {/* 展览与荣誉 #awards：美术馆编年细线名录 */}
        <section id="awards" className="site-section py-20 md:py-28 px-5 sm:px-8 md:px-12 bg-[#111110]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-mono tracking-[0.2em] text-[#e2785c] mb-3">展览名录</p>
                <h2 className="studio-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#f4f1ea]">
                  展览与荣誉
                </h2>
              </div>
              <p className="text-[#b8b3a8] text-sm md:text-base max-w-md">
                团队成员受邀参与的部分国内外顶级学术展览与电影节。
              </p>
            </div>

            <div className="h-px w-full bg-white/12 mt-8 mb-12" aria-hidden="true" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {AWARDS.map((award) => (
                <article key={award.title + award.year} className="site-print-avoid flex flex-col">
                  <div className="h-px w-full bg-white/10 mb-5" aria-hidden="true" />
                  <div className="flex items-baseline justify-between gap-6">
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-medium text-[#f4f1ea] leading-snug">
                        {award.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#b8b3a8] mt-1">{award.desc}</p>
                    </div>
                    <span className="shrink-0 font-mono text-xs sm:text-sm text-[#e2785c]">
                      {award.year}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-white/10" aria-hidden="true" />

        {/* 学术成果 #research：纯图 + 下置文字档，彻底告别暗层压图低对比 */}
        <section id="research" className="site-section py-20 md:py-28 px-5 sm:px-8 md:px-12 bg-[#0b0b0a]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-mono tracking-[0.2em] text-[#e2785c] mb-3">学术与研修</p>
                <h2 className="studio-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#f4f1ea]">
                  学术成果
                </h2>
              </div>
              <p className="text-[#b8b3a8] text-sm md:text-base max-w-2xl leading-relaxed">
                包含团队成员的论文发表、科研项目、论坛发言与学术交流，体现理论研究、跨学科方法与艺术实践之间的持续联动。
              </p>
            </div>

            <div className="h-px w-full bg-white/12 mt-8 mb-12" aria-hidden="true" />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
              {RESEARCH_ITEMS.map((item) => (
                <article key={item.title} className="site-plate-card group flex flex-col">
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#161614] border border-white/12">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="studio-plate-img object-cover"
                    />
                  </div>
                  <div className="pt-4">
                    <div className="text-xs font-mono text-[#e2785c] mb-1.5">{item.year}</div>
                    <h3 className="text-base sm:text-lg font-medium text-[#f4f1ea] leading-snug mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#b8b3a8] leading-relaxed">{item.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-white/10" aria-hidden="true" />

        {/* 团队成员 #team：双人学术与创作专版档案 */}
        <section id="team" className="site-section py-20 md:py-28 px-5 sm:px-8 md:px-12 bg-[#111110]">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <p className="text-xs font-mono tracking-[0.2em] text-[#e2785c] mb-3">我们是谁</p>
              <h2 className="studio-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#f4f1ea] mb-4 leading-snug">
                一个把技术放进真实工作与创作现场的工作室
              </h2>
              <p className="text-[#d4cfc4] text-sm md:text-base leading-relaxed">
                液态像素艺术工作室由艺术家与技术实践者组成。我们将影像、动画、新媒体、交互和影视制作经验，与人工智能和数字工具的实际应用结合起来：为企业团队优化具体工作流程，也与艺术家和创作团队共同把想法发展为可测试、可呈现的作品。
              </p>
            </div>

            <div className="h-px w-full bg-white/12 mt-8 mb-14" aria-hidden="true" />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 xl:gap-16">
              {/* 成员 01：任玄奇 */}
              <article className="site-print-avoid flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-5 mb-6">
                    <div className="relative shrink-0 w-20 sm:w-24 aspect-[3/4] overflow-hidden bg-[#161614] border border-white/15">
                      <Image
                        src="/portfolio-2025/meta/portrait-2026.webp"
                        alt="任玄奇肖像"
                        fill
                        sizes="96px"
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="pt-1">
                      <h3 className="studio-serif text-2xl font-semibold text-[#f4f1ea] mb-1.5">任玄奇</h3>
                      <p className="text-sm text-[#e2785c] leading-relaxed">
                        北京电影学院博士研究生 / 数字艺术 · 虚拟现实艺术 · 实验影像
                      </p>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-[#d4cfc4] leading-relaxed mb-6">
                    博士研究聚焦虚拟现实与沉浸式媒介感知，长期从事数字艺术创作、三维技术美术管线研发，以及涵盖独立游戏制作、前端产品开发与多模态工作流的 AI 开发实践。
                  </p>

                  <dl className="space-y-4 text-xs sm:text-sm">
                    <div>
                      <div className="h-px w-full bg-white/10 mb-3" aria-hidden="true" />
                      <div className="grid grid-cols-12 gap-2">
                        <dt className="col-span-4 sm:col-span-3 font-mono text-[#9e988d]">学术与研修</dt>
                        <dd className="col-span-8 sm:col-span-9 text-[#b8b3a8] leading-relaxed">
                          国家艺术基金沉浸式交互动漫人工智能创作人才培养、数字博物馆数字艺术人才培训
                        </dd>
                      </div>
                    </div>
                    <div>
                      <div className="h-px w-full bg-white/10 mb-3" aria-hidden="true" />
                      <div className="grid grid-cols-12 gap-2">
                        <dt className="col-span-4 sm:col-span-3 font-mono text-[#9e988d]">教学经历</dt>
                        <dd className="col-span-8 sm:col-span-9 text-[#b8b3a8] leading-relaxed">
                          2024–2026 天津美术学院《人工智能艺术》通识课程教师、2025 人工智能艺术高级研修班艺术创作教师
                        </dd>
                      </div>
                    </div>
                    <div>
                      <div className="h-px w-full bg-white/10 mb-3" aria-hidden="true" />
                      <div className="grid grid-cols-12 gap-2">
                        <dt className="col-span-4 sm:col-span-3 font-mono text-[#9e988d]">展览与展映</dt>
                        <dd className="col-span-8 sm:col-span-9 text-[#b8b3a8] leading-relaxed">
                          第十四届全国美展、首届中国数字艺术大展、首届中国计算机学会计算艺术大展、北京／海南岛国际电影节等
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>

                <div className="mt-6">
                  <div className="h-px w-full bg-white/10 mb-6" aria-hidden="true" />
                  <Link
                    href="/portfolio/"
                    prefetch={false}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#f4f1ea] hover:text-[#e2785c] transition-colors"
                  >
                    <span>进入任玄奇个人作品集与简历档案</span>
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>

              {/* 成员 02：吴于枫 */}
              <article className="site-print-avoid flex flex-col justify-between">
                <div>
                  <div className="h-px w-full bg-white/12 mb-10 xl:hidden" aria-hidden="true" />
                  <div className="flex items-start gap-5 mb-6">
                    <div className="relative shrink-0 w-20 sm:w-24 aspect-[3/4] overflow-hidden bg-[#161614] border border-white/15">
                      <Image
                        src="/images/wyf.webp"
                        alt="吴于枫肖像"
                        fill
                        sizes="96px"
                        className="object-cover object-[42%_18%]"
                      />
                    </div>
                    <div className="pt-1">
                      <h3 className="studio-serif text-2xl font-semibold text-[#f4f1ea] mb-1.5">吴于枫</h3>
                      <p className="text-sm text-[#e2785c] leading-relaxed">
                        气味与新媒体艺术家 / NAHA高阶芳疗师
                      </p>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-[#d4cfc4] leading-relaxed mb-6">
                    专注于新媒体公共艺术、疗愈空间构建与多感官交互。擅长将气味艺术与新兴数字媒介结合，联动五感，为商业地产、自然文旅及公共空间提供极具人文哲思与情感疗愈的沉浸式体验解决方案。
                  </p>

                  <dl className="space-y-4 text-xs sm:text-sm">
                    <div>
                      <div className="h-px w-full bg-white/10 mb-3" aria-hidden="true" />
                      <div className="grid grid-cols-12 gap-2">
                        <dt className="col-span-4 sm:col-span-3 font-mono text-[#9e988d]">参与展览</dt>
                        <dd className="col-span-8 sm:col-span-9 text-[#b8b3a8] leading-relaxed">
                          北京/海南岛国际电影节、青岛国际双年展、普达措生态艺术季等
                        </dd>
                      </div>
                    </div>
                    <div>
                      <div className="h-px w-full bg-white/10 mb-3" aria-hidden="true" />
                      <div className="grid grid-cols-12 gap-2">
                        <dt className="col-span-4 sm:col-span-3 font-mono text-[#9e988d]">专业资质</dt>
                        <dd className="col-span-8 sm:col-span-9 text-[#b8b3a8] leading-relaxed">
                          CIBTAC整全疗愈师
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>
              </article>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-white/10" aria-hidden="true" />

        {/* 联系我们 #contact */}
        <section id="contact" className="site-section py-20 md:py-28 px-5 sm:px-8 md:px-12 bg-[#0b0b0a]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <p className="text-xs font-mono tracking-[0.2em] text-[#e2785c] mb-3">预约沟通</p>
              <h2 className="studio-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#f4f1ea] leading-tight mb-5">
                聊聊一个工作难题，
                <br />
                或一个创作想法
              </h2>
              <p className="text-[#d4cfc4] text-sm md:text-base leading-relaxed max-w-lg">
                不管是团队总在重复做表格、写材料、整理信息，还是你正在准备新媒体、互动、影像或影视作品，欢迎带着一个具体问题来聊。我们会先听懂现状，再一起判断什么做法更合适。
              </p>
            </div>

            <div className="lg:col-span-6 flex flex-col sm:flex-row items-start sm:items-center gap-10 lg:justify-end">
              <div className="flex items-center gap-5">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 bg-black border border-white/15 p-2">
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/qrcode_dark.webp"
                      alt="微信联系二维码"
                      fill
                      sizes="128px"
                      className="object-contain"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-[#f4f1ea] mb-1">扫码聊聊合作可能</div>
                  <div className="text-xs font-mono text-[#b8b3a8]">微信号：Feuille_1100</div>
                </div>
              </div>

              <div className="hidden sm:block w-px h-24 bg-white/15" aria-hidden="true" />

              <div>
                <a
                  href="mailto:feuillefeng@foxmail.com"
                  className="inline-flex items-center gap-2.5 text-sm sm:text-base font-medium text-[#f4f1ea] hover:text-[#e2785c] transition-colors mb-1.5"
                >
                  <Mail className="w-4 h-4 text-[#e2785c]" aria-hidden="true" />
                  <span>邮件预约交流</span>
                </a>
                <div className="text-xs font-mono text-[#b8b3a8]">feuillefeng@foxmail.com</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="h-px w-full bg-white/10" aria-hidden="true" />

      <footer className="site-footer bg-[#0b0b0a]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9e988d]">
          <p>© {new Date().getFullYear()} 液态像素艺术工作室 · 企业团队与艺术家技术协作</p>
          <Link href="/portfolio/" prefetch={false} className="hover:text-[#f4f1ea] transition-colors">
            任玄奇作品集 ARCHIVE ↗
          </Link>
        </div>
      </footer>
    </div>
  );
}
