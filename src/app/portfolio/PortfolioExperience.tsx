"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { ArrowDownRight, ChevronLeft, ChevronRight, Copy, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
} from "react";
import { artWorks, studioWorks, type Work } from "./works";

const motionQuery = "(prefers-reduced-motion: reduce)";

function subscribeMotion(callback: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

const getReducedMotion = () => window.matchMedia(motionQuery).matches;
const getServerMotion = () => true;
const PageField3D = dynamic(() => import("./PageField3D"), { ssr: false });

const navigation = [
  ["achievements", "履历与研究"],
  ["art", "艺术创作"],
  ["about", "关于"],
  ["contact", "联系"],
];

const achievementGroups = [
  {
    title: "论文与学术会议",
    items: [
      { year: "[ 1 ]", title: "《梦核美学：伯明翰学派视角下的跨媒介符号与视觉表达研究》", detail: "[D]. 天津美术学院。" },
      { year: "[ 2 ]", title: "《三维游戏“一公米线上实体店”建设研究》", detail: "[J]. 教育前沿。" },
      { year: "[ 3 ]", title: "《媒介考古：技术缺陷下的影像认知重构》", detail: "北京国际电影节第六届国际青年学者论坛 / 北京师范大学。" },
      { year: "[ 4 ]", title: "《人工智能图像生成技术下的杨柳青木版年画非遗数字化焕新研究》", detail: "新媒体与非物质文化遗产传承创新学术论坛 / 中央民族大学。" },
      { year: "[ 5 ]", title: "《从弱影像到提示词：AIGC 时代梦核美学的算法收编与作者性危机》", detail: "第十届网络社会年会青年学者论坛 / 中国美术学院。" },
    ],
  },
  {
    title: "人才培养与研究项目",
    items: [
      { year: "[ 6 ]", title: "国家艺术基金 · 数字博物馆数字艺术人才培训资助项目", detail: "文化和旅游部艺术发展中心 / 驻地创作。" },
      { year: "[ 7 ]", title: "国家艺术基金 · 沉浸式交互动漫人工智能创作人才培养资助项目", detail: "中国动漫集团 / 人才培养。" },
      { year: "[ 8 ]", title: "基于人机交互技术的 OMO 智慧教学应用模式研究", detail: "天津市科研创新项目。" },
    ],
  },
  {
    title: "获奖与展览展映",
    items: [
      { year: "2026", title: "第十六届北京国际电影节 · 无界沉浸单元", detail: "《桥渡牵牛织女星》" },
      { year: "2025", title: "首届 CCF 计算艺术大展", detail: "中国计算机学会 / 《苏醒》" },
      { year: "2025", title: "第七届海南岛国际电影节 · 实验影像单元", detail: "《坍缩》" },
      { year: "2024", title: "首届中国数字艺术大展", detail: "中国美术家协会 / 《生物炼金术》" },
      { year: "2024", title: "第十四届全国美展暨天津市美术展览", detail: "中国美术家协会、天津文学艺术界联合会 / 《坍缩》" },
      { year: "2024", title: "北京国际摄影周暨首届青年影像艺术 100 展", detail: "中国艺术摄影学会 / 《坍缩》" },
    ],
  },
];

function SectionLabel({ number, children }: { number: string; children: ReactNode }) {
  return <p className="studio-section-label"><span>{number}</span>{children}</p>;
}

function WorkMedia({ work, reducedMotion, detail = false }: {
  work: Work;
  reducedMotion: boolean;
  detail?: boolean;
}) {
  const sources = work.gallery?.length ? work.gallery : work.gif ? [work.gif] : work.image ? [work.image] : [];
  const sourceKey = sources.join("|");
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (reducedMotion || sources.length < 2) return;
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % sources.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [reducedMotion, sourceKey, sources.length]);

  const safeSlide = slide % Math.max(sources.length, 1);
  const source = reducedMotion ? (work.poster ?? sources[0]) : sources[safeSlide];

  return (
    <div className={"studio-media studio-media--" + work.id + (detail ? " studio-media--detail" : "")}>
      {source ? (
        <Image
          key={source}
          src={source}
          alt={"《" + work.title + "》影像预览"}
          fill
          sizes={detail ? "(max-width: 700px) 94vw, 72vw" : "(max-width: 700px) 92vw, 43vw"}
          unoptimized
          priority={detail}
        />
      ) : (
        <div className="studio-media-placeholder"><span>IMAGE SLOT</span><strong>{work.title}</strong></div>
      )}
      {sources.length > 1 && (
        <span className="studio-media-count" aria-hidden="true">
          {String(safeSlide + 1).padStart(2, "0")} / {String(sources.length).padStart(2, "0")}
        </span>
      )}
    </div>
  );
}

function WorkCard({ work, reducedMotion, open }: {
  work: Work;
  reducedMotion: boolean;
  open: (event: MouseEvent<HTMLAnchorElement>, work: Work) => void;
}) {
  return (
    <article className="studio-work" id={work.id} data-work-id={work.id}>
      <a
        className="studio-work-image"
        href={"#" + work.id}
        onClick={(event) => open(event, work)}
        aria-label={"查看《" + work.title + "》的图文档案"}
      >
        <WorkMedia work={work} reducedMotion={reducedMotion} />
        <span className="studio-image-link">打开档案 <ArrowDownRight size={15} aria-hidden="true" /></span>
      </a>
      <div className="studio-work-meta"><span>{work.no}</span><span>{work.year}</span></div>
      <h3>
        <a href={"#" + work.id} onClick={(event) => open(event, work)}>
          {work.title}<ArrowDownRight size={21} aria-hidden="true" />
        </a>
      </h3>
      <p className="studio-work-medium">{work.medium}</p>
      <p className="studio-work-description">{work.description}</p>
    </article>
  );
}

export default function PortfolioExperience() {
  const reducedMotion = useSyncExternalStore(subscribeMotion, getReducedMotion, getServerMotion);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const [fieldFailed, setFieldFailed] = useState(false);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const detailOpen = activeIndex !== null;
  const detailWork = studioWorks[activeIndex ?? 0];
  const handleFieldFailure = useCallback(() => setFieldFailed(true), []);

  const openWork = (event: MouseEvent<HTMLAnchorElement>, work: Work) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    triggerRef.current = event.currentTarget;
    setActiveIndex(studioWorks.findIndex((item) => item.id === work.id));
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!detailOpen || !dialog) return;
    const previousOverflow = document.documentElement.style.overflow;
    if (!dialog.open) dialog.showModal();
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [detailOpen]);

  const closeDetail = () => dialogRef.current?.close();
  const restoreFocus = () => {
    setActiveIndex(null);
    triggerRef.current?.focus({ preventScroll: true });
  };
  const changeWork = (direction: number) => {
    setActiveIndex((current) => ((current ?? 0) + direction + studioWorks.length) % studioWorks.length);
  };
  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false;
  };
  const copyWechat = async () => {
    try {
      await navigator.clipboard.writeText("r1062046861");
      setCopyMessage("微信号已复制");
    } catch {
      setCopyMessage("微信号：r1062046861");
    }
  };

  return (
    <div className="studio-site">
      <a className="studio-skip" href="#achievements">跳到正文</a>

      <header className="studio-header">
        <a className="studio-brand" href="#top" aria-label="任玄奇作品集，回到顶部">
          <span className="studio-brand-mark" aria-hidden="true">任</span>
          <span>任玄奇<span className="studio-brand-en">PORTFOLIO / 2026</span></span>
        </a>
        <nav className="studio-desktop-nav" aria-label="主导航">
          {navigation.map(([id, label]) => <a key={id} href={"#" + id}>{label}</a>)}
        </nav>
        <details className="studio-mobile-nav" ref={menuRef} onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeMenu();
            menuRef.current?.querySelector("summary")?.focus();
          }
        }}>
          <summary>菜单 <span aria-hidden="true">＋</span></summary>
          <nav aria-label="手机主导航">
            {navigation.map(([id, label]) => <a key={id} href={"#" + id} onClick={closeMenu}>{label}<ArrowDownRight size={16} aria-hidden="true" /></a>)}
          </nav>
        </details>
      </header>

      <main>
        <section className="studio-hero" id="top" aria-labelledby="studio-title">
          <div className="studio-hero-field" aria-hidden="true">
            {!fieldFailed && <PageField3D paused={reducedMotion} onFailure={handleFieldFailure} />}
            <div className="studio-hero-vignette" />
          </div>
          <div className="studio-hero-copy">
            <p className="studio-eyebrow"><span />ART / RESEARCH / EXPERIMENT</p>
            <h1 id="studio-title">任玄奇<br /><em>作品集</em></h1>
            <p className="studio-hero-subtitle">虚拟现实 · 科技艺术 · 实验影像</p>
            <p className="studio-hero-intro">在影像、算法与感知之间，<br />让作品成为一次现场。</p>
          </div>
          <div className="studio-hero-index"><span>SELECTED WORKS</span><strong>01 — {String(artWorks.length).padStart(2, "0")}</strong><span>SCROLL TO EXPLORE ↓</span></div>
        </section>

        <section className="studio-section studio-achievements-section" id="achievements" aria-labelledby="achievements-title">
          <SectionLabel number="01">RECORD / 履历与研究</SectionLabel>
          <div className="studio-section-heading">
            <h2 id="achievements-title">先看发生过什么。</h2>
            <p>论文、会议、人才培养项目与展览展映。<span>REN XUANQI / SELECTED RECORDS</span></p>
          </div>
          <div className="studio-achievement-grid">
            {achievementGroups.map((group) => (
              <section className="studio-achievement-group" key={group.title} aria-labelledby={"achievement-" + group.title}>
                <h3 id={"achievement-" + group.title}>{group.title}</h3>
                <ol className="studio-achievement-list">
                  {group.items.map((item) => (
                    <li key={group.title + item.title}>
                      <span>{item.year}</span>
                      <div><strong>{item.title}</strong><p>{item.detail}</p></div>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </section>

        <section className="studio-section studio-art-section" id="art" aria-labelledby="art-title">
          <SectionLabel number="02">SELECTED WORKS / 艺术创作</SectionLabel>
          <div className="studio-section-heading">
            <h2 id="art-title">把观看变成现场。</h2>
            <p>影像、生命与记忆的实验记录。<span>2022 — 2026 / {artWorks.length} WORKS</span></p>
          </div>
          <div className="studio-art-grid">
            {artWorks.map((work) => <WorkCard key={work.id} work={work} reducedMotion={reducedMotion} open={openWork} />)}
          </div>
        </section>

        <section className="studio-section studio-about-section" id="about" aria-labelledby="about-title">
          <SectionLabel number="03">REN XUANQI / 关于任玄奇</SectionLabel>
          <div className="studio-about-grid">
            <div className="studio-about-copy">
              <h2 id="about-title">任玄奇</h2>
              <p className="studio-about-role">数字艺术创作者 · 科技艺术研究者</p>
              <p>北京电影学院博士研究生，硕士毕业于天津美术学院跨媒体艺术专业。研究重点放在虚拟现实、沉浸式媒介与技术感知之间的关系。</p>
              <p>以实时计算、生成算法、交互装置与空间叙事为实践路径，展开先锋性、实验性的科技艺术研究：在虚实交叠的空间、身体经验与机器视野之间，追问技术如何改变叙事、观看与共同感知。</p>
            </div>
          </div>
        </section>

        <section className="studio-section studio-contact-section" id="contact" aria-labelledby="contact-title">
          <SectionLabel number="04">GET IN TOUCH / 联系</SectionLabel>
          <div className="studio-contact-grid">
            <div><h2 id="contact-title">聊聊正在发生<br />的想法。<ArrowDownRight size={46} aria-hidden="true" /></h2><p>关于创作、研究，或一个尚未成形的问题。</p></div>
            <div className="studio-contact-links">
              <a href="mailto:1062046861@qq.com"><span>邮箱 / EMAIL</span><strong>1062046861@qq.com</strong><ArrowDownRight size={22} aria-hidden="true" /></a>
              <button type="button" onClick={copyWechat}><span>微信 / WECHAT</span><strong>r1062046861</strong><Copy size={20} aria-hidden="true" /></button>
              <p className="studio-copy-message" role="status">{copyMessage || "欢迎交流，慢慢展开。"}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="studio-footer"><p>© {new Date().getFullYear()} 任玄奇作品集</p><span>ART / RESEARCH / POSSIBILITIES</span><a href="#top">回到顶部 ↑</a></footer>

      <dialog className="studio-dialog" ref={dialogRef} aria-labelledby="archive-title" onClose={restoreFocus} onClick={(event) => {
        if (event.target === event.currentTarget) closeDetail();
      }} onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          changeWork(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}>
        <div className="studio-archive">
          <div className="studio-archive-bar">
            <p>作品档案 / <span>{String((activeIndex ?? 0) + 1).padStart(2, "0")} — {studioWorks.length}</span></p>
            <button autoFocus type="button" onClick={closeDetail} aria-label="关闭作品档案"><span>关闭</span><X size={22} aria-hidden="true" /></button>
          </div>
          {detailOpen && detailWork && (
            <>
              <div className="studio-archive-image"><WorkMedia work={detailWork} reducedMotion={reducedMotion} detail /></div>
              <div className="studio-archive-copy">
                <p className="studio-section-label">{detailWork.category} / {detailWork.no}</p>
                <h2 id="archive-title" aria-live="polite">{detailWork.title}</h2>
                <dl><div><dt>年份</dt><dd>{detailWork.year}</dd></div><div><dt>媒介</dt><dd>{detailWork.medium}</dd></div></dl>
                <p>{detailWork.description}</p>
              </div>
            </>
          )}
          <div className="studio-archive-navigation">
            <button type="button" onClick={() => changeWork(-1)} aria-label="上一项"><ChevronLeft size={20} aria-hidden="true" /><span>上一项</span></button>
            <span>← → 切换 · Esc 关闭</span>
            <button type="button" onClick={() => changeWork(1)} aria-label="下一项"><span>下一项</span><ChevronRight size={20} aria-hidden="true" /></button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
