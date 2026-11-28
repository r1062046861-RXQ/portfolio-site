import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail } from "lucide-react";
import StudioHeader from "./_components/StudioHeader";
import CinemaHero from "./_components/CinemaHero";
import CuratedWorksShowcase from "./_components/CuratedWorksShowcase";
import InteractiveArchive from "./_components/InteractiveArchive";

type ServiceBranch = {
  code: string;
  audience: string;
  title: string;
  desc: string;
  steps: {
    no: string;
    title: string;
    desc: string;
    tags: string[];
  }[];
};

const SERVICE_BRANCHES: ServiceBranch[] = [
  {
    code: "ENTERPRISE",
    audience: "给企业团队",
    title: "把重复的工作，变成更顺手的做法",
    desc: "围绕真实工作流程，留下能复用的操作步骤、模板和检查清单。",
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
    code: "CREATIVE",
    audience: "给艺术家与创作团队",
    title: "把创作想法，推进到可以呈现的样子",
    desc: "围绕新媒体、交互、影像与影视制作，提供从测试到呈现的技术协作。",
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

export default function Home() {
  return (
    <div className="site-shell min-h-screen flex flex-col bg-[#050506] text-[#f5f6f8]">
      <StudioHeader />

      <main id="top" className="flex-1">
        {/* 全出血电影银幕 × 液态光学首屏 */}
        <CinemaHero />

        {/* 合作方向 #services：承接首屏说明企业团队与创作协作两条路径 */}
        <section id="services" className="site-section py-24 md:py-36 px-5 sm:px-8 md:px-12 bg-[#050506]">
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-12 items-start">
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-medium tracking-[-0.025em] leading-[1.15] text-[#f5f6f8] mb-6">
                让工作顺畅，
                <br />
                也让创作落地
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-[#c4c7ce] mb-8">
                我们从一件具体的事开始：企业团队里总在重复、卡住的工作，或艺术家与创作团队正在寻找技术路径的创作构想。一起找到合适做法，再把它落实为团队或作品可持续使用的成果。
              </p>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#f5f6f8] hover:text-[#c4c7ce] transition-colors"
              >
                <span>从一个具体问题开始</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>

            <div className="lg:col-span-7 lg:col-start-6 space-y-20 md:space-y-24">
              {SERVICE_BRANCHES.map((branch, branchIdx) => (
                <div key={branch.code} className="site-print-avoid">
                  {branchIdx > 0 && (
                    <div className="h-px w-full bg-white/12 mb-16 md:mb-20" aria-hidden="true" />
                  )}

                  <h3 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#f5f6f8] mb-2 leading-snug">
                    {branch.title}
                  </h3>
                  <p className="text-sm text-[#9398a3] mb-4">{branch.audience}</p>
                  <p className="text-sm sm:text-base text-[#c4c7ce] leading-relaxed mb-10 max-w-2xl">
                    {branch.desc}
                  </p>

                  <ol className="space-y-8">
                    {branch.steps.map((step) => (
                      <li key={step.no}>
                        <div className="h-px w-full bg-white/10 mb-7" aria-hidden="true" />
                        <div className="grid grid-cols-12 gap-4 items-start">
                          <span className="col-span-2 sm:col-span-1 text-xs font-mono tabular-nums text-[#9398a3] pt-1">
                            {step.no}
                          </span>
                          <div className="col-span-10 sm:col-span-11">
                            <h4 className="text-lg font-medium text-[#f5f6f8] mb-2">{step.title}</h4>
                            <p className="text-sm leading-relaxed text-[#c4c7ce] mb-3 max-w-xl">
                              {step.desc}
                            </p>
                            <p className="text-xs font-mono tracking-[0.08em] text-[#9398a3]">
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
          </div>
        </section>

        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12">
          <div className="h-px w-full bg-white/10" aria-hidden="true" />
        </div>

        {/* 非对称 4 幕作品长卷（10 项完整实践档案） */}
        <CuratedWorksShowcase />

        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12">
          <div className="h-px w-full bg-white/10" aria-hidden="true" />
        </div>

        {/* 展览荣誉与学术成果 #awards / #research：交互编年目录 + 光学悬停预览 */}
        <InteractiveArchive />

        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12">
          <div className="h-px w-full bg-white/10" aria-hidden="true" />
        </div>

        {/* 团队成员 #team：电影演职员表式大留白双人档案 */}
        <section id="team" className="site-section py-24 md:py-36 px-5 sm:px-8 md:px-12 bg-[#050506]">
          <div className="max-w-[1440px] mx-auto">
            <div className="max-w-3xl mb-14 md:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.025em] text-[#f5f6f8] mb-5 leading-tight">
                一个把技术放进真实工作与创作现场的工作室
              </h2>
              <p className="text-[#c4c7ce] text-sm sm:text-base leading-relaxed">
                液态像素艺术工作室由艺术家与技术实践者组成。我们将影像、动画、新媒体、交互和影视制作经验，与人工智能和数字工具的实际应用结合起来：为企业团队优化具体工作流程，也与艺术家和创作团队共同把想法发展为可测试、可呈现的作品。
              </p>
            </div>

            <div className="h-px w-full bg-white/10 mb-14 md:mb-16" aria-hidden="true" />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-16 xl:gap-12">
              {/* 成员 01：任玄奇 */}
              <article className="site-print-avoid xl:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-6 mb-7">
                    <div className="cinema-optical-frame relative shrink-0 w-24 sm:w-28 aspect-[3/4] overflow-hidden bg-[#0e0e12]">
                      <Image
                        src="/portfolio-2025/meta/portrait-2026.webp"
                        alt="任玄奇肖像"
                        fill
                        sizes="112px"
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="pt-1">
                      <h3 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#f5f6f8] mb-2">
                        任玄奇
                      </h3>
                      <p className="text-sm text-[#c4c7ce] leading-relaxed">
                        北京电影学院博士研究生 / 数字艺术 · 虚拟现实艺术 · 实验影像
                      </p>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-[#c4c7ce] leading-relaxed mb-8">
                    博士研究聚焦虚拟现实与沉浸式媒介感知，长期从事数字艺术创作、三维技术美术管线研发，以及涵盖独立游戏制作、前端产品开发与多模态工作流的 AI 开发实践。
                  </p>

                  <dl className="space-y-4 text-xs sm:text-sm">
                    <div>
                      <div className="h-px w-full bg-white/10 mb-3.5" aria-hidden="true" />
                      <div className="grid grid-cols-12 gap-3">
                        <dt className="col-span-4 sm:col-span-3 font-mono text-[#9398a3]">学术与研修</dt>
                        <dd className="col-span-8 sm:col-span-9 text-[#c4c7ce] leading-relaxed">
                          国家艺术基金沉浸式交互动漫人工智能创作人才培养、数字博物馆数字艺术人才培训
                        </dd>
                      </div>
                    </div>
                    <div>
                      <div className="h-px w-full bg-white/10 mb-3.5" aria-hidden="true" />
                      <div className="grid grid-cols-12 gap-3">
                        <dt className="col-span-4 sm:col-span-3 font-mono text-[#9398a3]">教学经历</dt>
                        <dd className="col-span-8 sm:col-span-9 text-[#c4c7ce] leading-relaxed">
                          2024–2026 天津美术学院《人工智能艺术》通识课程教师、2025 人工智能艺术高级研修班艺术创作教师
                        </dd>
                      </div>
                    </div>
                    <div>
                      <div className="h-px w-full bg-white/10 mb-3.5" aria-hidden="true" />
                      <div className="grid grid-cols-12 gap-3">
                        <dt className="col-span-4 sm:col-span-3 font-mono text-[#9398a3]">展览与展映</dt>
                        <dd className="col-span-8 sm:col-span-9 text-[#c4c7ce] leading-relaxed">
                          第十四届全国美展、首届中国数字艺术大展、首届中国计算机学会计算艺术大展、北京／海南岛国际电影节等
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>

                <div className="mt-8">
                  <div className="h-px w-full bg-white/10 mb-6" aria-hidden="true" />
                  <Link
                    href="/portfolio/"
                    prefetch={false}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#f5f6f8] hover:text-[#c4c7ce] transition-colors"
                  >
                    <span>进入任玄奇个人作品集与简历档案</span>
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>

              {/* 成员 02：吴于枫 */}
              <article className="site-print-avoid xl:col-span-5 xl:col-start-8 flex flex-col justify-between">
                <div>
                  <div className="h-px w-full bg-white/10 mb-12 xl:hidden" aria-hidden="true" />
                  <div className="flex items-start gap-6 mb-7">
                    <div className="cinema-optical-frame relative shrink-0 w-24 sm:w-28 aspect-[3/4] overflow-hidden bg-[#0e0e12]">
                      <Image
                        src="/images/wyf.webp"
                        alt="吴于枫肖像"
                        fill
                        sizes="112px"
                        className="object-cover object-[42%_18%]"
                      />
                    </div>
                    <div className="pt-1">
                      <h3 className="text-2xl sm:text-3xl font-medium tracking-[-0.02em] text-[#f5f6f8] mb-2">
                        吴于枫
                      </h3>
                      <p className="text-sm text-[#c4c7ce] leading-relaxed">
                        气味与新媒体艺术家 / NAHA高阶芳疗师
                      </p>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-[#c4c7ce] leading-relaxed mb-8">
                    专注于新媒体公共艺术、疗愈空间构建与多感官交互。擅长将气味艺术与新兴数字媒介结合，联动五感，为商业地产、自然文旅及公共空间提供极具人文哲思与情感疗愈的沉浸式体验解决方案。
                  </p>

                  <dl className="space-y-4 text-xs sm:text-sm">
                    <div>
                      <div className="h-px w-full bg-white/10 mb-3.5" aria-hidden="true" />
                      <div className="grid grid-cols-12 gap-3">
                        <dt className="col-span-4 sm:col-span-3 font-mono text-[#9398a3]">参与展览</dt>
                        <dd className="col-span-8 sm:col-span-9 text-[#c4c7ce] leading-relaxed">
                          北京/海南岛国际电影节、青岛国际双年展、普达措生态艺术季等
                        </dd>
                      </div>
                    </div>
                    <div>
                      <div className="h-px w-full bg-white/10 mb-3.5" aria-hidden="true" />
                      <div className="grid grid-cols-12 gap-3">
                        <dt className="col-span-4 sm:col-span-3 font-mono text-[#9398a3]">专业资质</dt>
                        <dd className="col-span-8 sm:col-span-9 text-[#c4c7ce] leading-relaxed">
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

        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12">
          <div className="h-px w-full bg-white/10" aria-hidden="true" />
        </div>

        {/* 联系我们 #contact：静谧暗房落幕 */}
        <section id="contact" className="site-section py-24 md:py-36 px-5 sm:px-8 md:px-12 bg-[#050506]">
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.025em] text-[#f5f6f8] leading-tight mb-5">
                聊聊一个工作难题，
                <br />
                或一个创作想法
              </h2>
              <p className="text-[#c4c7ce] text-sm sm:text-base leading-relaxed max-w-lg">
                不管是团队总在重复做表格、写材料、整理信息，还是你正在准备新媒体、互动、影像或影视作品，欢迎带着一个具体问题来聊。我们会先听懂现状，再一起判断什么做法更合适。
              </p>
            </div>

            <div className="lg:col-span-6 flex flex-col sm:flex-row items-start sm:items-center gap-10 lg:justify-end">
              <div className="flex items-center gap-5">
                <div className="cinema-optical-frame relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 bg-black p-2">
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
                  <div className="text-sm font-medium text-[#f5f6f8] mb-1">扫码聊聊合作可能</div>
                  <div className="text-xs font-mono text-[#c4c7ce]">微信号：Feuille_1100</div>
                </div>
              </div>

              <div className="hidden sm:block w-px h-24 bg-white/12" aria-hidden="true" />

              <div>
                <a
                  href="mailto:feuillefeng@foxmail.com"
                  className="inline-flex items-center gap-2.5 text-sm sm:text-base font-medium text-[#f5f6f8] hover:text-[#c4c7ce] transition-colors mb-1.5"
                >
                  <Mail className="w-4 h-4 text-[#c4c7ce]" aria-hidden="true" />
                  <span>邮件预约交流</span>
                </a>
                <div className="text-xs font-mono text-[#c4c7ce]">feuillefeng@foxmail.com</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="max-w-[1440px] mx-auto w-full px-5 sm:px-8 md:px-12">
        <div className="h-px w-full bg-white/10" aria-hidden="true" />
      </div>

      <footer className="site-footer bg-[#050506]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 py-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9398a3]">
          <p>© {new Date().getFullYear()} 液态像素艺术工作室 · 企业团队与艺术家技术协作</p>
          <Link href="/portfolio/" prefetch={false} className="hover:text-[#f5f6f8] transition-colors">
            任玄奇作品集 ARCHIVE ↗
          </Link>
        </div>
      </footer>
    </div>
  );
}
