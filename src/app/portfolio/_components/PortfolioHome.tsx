"use client";

import Link from "next/link";
import { ArrowDown, ArrowDownRight, ArrowLeft, Check, Copy, Edit3 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { CategoryId, ProjectData, SiteConfig } from "@/data/portfolio2025/schema";
import { EditableText } from "./EditableText";
import { EditToolbar } from "./EditToolbar";
import { Lightbox } from "./Lightbox";
import { setPortfolioEditUrl, usePortfolioDraft } from "./usePortfolioDraft";

const THEME_BADGE: Record<ProjectData["theme"], string> = {
  gallery: "画廊白",
  obsidian: "炭黑",
  parchment: "暖米纸",
  cerulean: "天美蓝",
  mist: "冷灰",
};

export function PortfolioHome({
  initialSite,
  projects,
}: {
  initialSite: SiteConfig;
  projects: ProjectData[];
}) {
  const {
    data: site,
    editMode,
    hasDraft,
    updateData,
    resetDraft,
    importJsonText,
    downloadJson,
    getSerializedJson,
  } = usePortfolioDraft<SiteConfig>("site", initialSite);

  const [activeCategory, setActiveCategory] = useState<"all" | CategoryId>("all");
  const [viewMode, setViewMode] = useState<"cards" | "index">("cards");
  const [copyHint, setCopyHint] = useState("");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  const closeMenu = () => {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  };

  const handleCopyWechat = async () => {
    try {
      await navigator.clipboard.writeText(site.contact.wechat);
      setCopyHint("微信号已复制");
    } catch {
      setCopyHint(`微信号：${site.contact.wechat}`);
    }
    window.setTimeout(() => setCopyHint(""), 2600);
  };

  const visibleChapters = useMemo(() => {
    if (activeCategory === "all") return site.chapters;
    return site.chapters.filter((ch) => ch.id === activeCategory);
  }, [site.chapters, activeCategory]);

  const homeLightboxItems = useMemo(() => {
    const items = [site.profile.portrait];
    for (const ch of site.chapters) {
      if (ch.dividerImage) items.push(ch.dividerImage);
    }
    return items;
  }, [site]);

  const openLightboxBySrc = (src: string) => {
    const idx = homeLightboxItems.findIndex((i) => i.src === src);
    setLightboxIdx(idx >= 0 ? idx : 0);
  };

  return (
    <div className="pf-root" data-theme="gallery">
      <a className="pf-skip" href="#works">
        跳到作品目录
      </a>

      {/* 顶部导航 */}
      <header className="pf-header">
        <div className="pf-container pf-header-inner">
          <div className="pf-header-left">
            <a className="pf-brand" href="#top" aria-label="回到作品集顶部">
              <span className="pf-brand-seal" aria-hidden="true">
                任
              </span>
              <span className="pf-brand-text">
                <strong>任玄奇作品集</strong>
                <span>{site.cover.span}</span>
              </span>
            </a>

            <Link className="pf-home-btn" href={site.contact.homeHref} prefetch={false}>
              <ArrowLeft size={14} aria-hidden="true" />
              <span>{site.contact.homeLabel}</span>
            </Link>
          </div>

          <nav className="pf-nav" aria-label="作品集章节导航">
            <a href="#profile">个人简介</a>
            <a href="#records">履历论文</a>
            <a href="#works">作品总览 (17)</a>
            <a href="#contact">联系</a>
          </nav>

          <details className="pf-mobile-menu" ref={mobileMenuRef}>
            <summary>目录导航 ＋</summary>
            <nav aria-label="手机导航">
              <a href="#profile" onClick={closeMenu}>
                个人简介
              </a>
              <a href="#records" onClick={closeMenu}>
                履历与学术论文
              </a>
              <a href="#works" onClick={closeMenu}>
                全部 17 件作品
              </a>
              <a href="#contact" onClick={closeMenu}>
                联系方式
              </a>
            </nav>
          </details>
        </div>
      </header>

      <main id="top">
        {/* 封面横幅 */}
        <section className="pf-cover" aria-labelledby="pf-cover-title">
          <img
            src={site.cover.backgroundImage}
            alt="2025作品集流体几何主视觉"
            className="pf-cover-bg"
          />
          <div className="pf-container">
            <div className="pf-cover-inner">
              <div>
                <EditableText
                  as="p"
                  className="pf-cover-eyebrow"
                  value={site.cover.eyebrow}
                  editMode={editMode}
                  onCommit={(v) =>
                    updateData((prev) => ({ ...prev, cover: { ...prev.cover, eyebrow: v } }))
                  }
                />
                <EditableText
                  as="h1"
                  value={site.cover.title}
                  editMode={editMode}
                  onCommit={(v) =>
                    updateData((prev) => ({ ...prev, cover: { ...prev.cover, title: v } }))
                  }
                />
                <EditableText
                  as="p"
                  className="pf-cover-subtitle"
                  value={site.cover.subtitle}
                  editMode={editMode}
                  onCommit={(v) =>
                    updateData((prev) => ({ ...prev, cover: { ...prev.cover, subtitle: v } }))
                  }
                />
                <div className="pf-cover-actions">
                  <a className="pf-btn-primary" href="#works">
                    <span>浏览全部 {projects.length} 件作品</span>
                    <ArrowDown size={15} aria-hidden="true" />
                  </a>
                  <a className="pf-btn-secondary" href="#records">
                    <span>查看个人简介与论文</span>
                  </a>
                </div>
              </div>

              <div className="pf-cover-aside">
                <EditableText
                  as="p"
                  className="pf-cover-intro"
                  multiline
                  value={site.cover.intro}
                  editMode={editMode}
                  onCommit={(v) =>
                    updateData((prev) => ({ ...prev, cover: { ...prev.cover, intro: v } }))
                  }
                />
                <div className="pf-cover-stats">
                  <span>Ⅰ 艺术创作 × 8</span>
                  <span>Ⅱ 科研课题 × 3</span>
                  <span>Ⅲ 商业项目 × 6</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 个人简介与 2026 核心方向 */}
        <section className="pf-section" id="profile" aria-labelledby="pf-profile-title">
          <div className="pf-container">
            <div className="pf-sec-head">
              <div>
                <p className="pf-sec-kicker">01 / PROFILE · 个人简介</p>
                <h2 id="pf-profile-title">关于作者</h2>
              </div>
              <p className="pf-sec-desc">跨媒体数字艺术创作 · 三维技术美术 · AI 多模态开发</p>
            </div>

            <div className="pf-profile-grid">
              <div>
                <EditableText
                  as="h3"
                  className="pf-profile-name"
                  value={site.profile.name}
                  editMode={editMode}
                  onCommit={(v) =>
                    updateData((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, name: v },
                    }))
                  }
                />
                <EditableText
                  as="p"
                  className="pf-profile-role"
                  value={site.profile.role}
                  editMode={editMode}
                  onCommit={(v) =>
                    updateData((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, role: v },
                    }))
                  }
                />
                <EditableText
                  as="p"
                  className="pf-profile-bio"
                  multiline
                  value={site.profile.bio}
                  editMode={editMode}
                  onCommit={(v) =>
                    updateData((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, bio: v },
                    }))
                  }
                />

                <div className="pf-directions-grid">
                  {site.profile.directions.map((dir, idx) => (
                    <article key={dir.title + idx} className="pf-direction-card">
                      <EditableText
                        as="h3"
                        value={dir.title}
                        editMode={editMode}
                        onCommit={(v) =>
                          updateData((prev) => {
                            const dirs = [...prev.profile.directions];
                            dirs[idx] = { ...dirs[idx], title: v };
                            return { ...prev, profile: { ...prev.profile, directions: dirs } };
                          })
                        }
                      />
                      <EditableText
                        as="p"
                        multiline
                        value={dir.description}
                        editMode={editMode}
                        onCommit={(v) =>
                          updateData((prev) => {
                            const dirs = [...prev.profile.directions];
                            dirs[idx] = { ...dirs[idx], description: v };
                            return { ...prev, profile: { ...prev.profile, directions: dirs } };
                          })
                        }
                      />
                    </article>
                  ))}
                </div>
              </div>

              <figure className="pf-portrait-frame">
                <button
                  type="button"
                  onClick={() => openLightboxBySrc(site.profile.portrait.src)}
                  style={{ display: "block", width: "100%", padding: 0, cursor: "zoom-in" }}
                  aria-label="放大查看任玄奇肖像"
                >
                  <img
                    src={site.profile.portrait.src}
                    alt={site.profile.portrait.alt}
                  />
                </button>
                <figcaption className="pf-portrait-caption">
                  {site.profile.portrait.caption || "任玄奇 · 2026"}
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 2026 履历与学术档案 */}
        <section className="pf-section" id="records" aria-labelledby="pf-records-title">
          <div className="pf-container">
            <div className="pf-sec-head">
              <div>
                <p className="pf-sec-kicker">02 / ACADEMIC &amp; EXHIBITION LEDGER</p>
                <h2 id="pf-records-title">教育经历、高校教学、学术论文与展览记录</h2>
              </div>
              <p className="pf-sec-desc">按时间严格倒序排列 · 同步最新 2026 个人简历口径</p>
            </div>

            <div className="pf-records-grid">
              {/* 教育背景与研修 */}
              <div className="pf-record-group">
                <h3>教育背景与国家级研修</h3>
                <ul className="pf-record-list">
                  {site.records.education.map((item, idx) => (
                    <li key={idx} className="pf-record-item">
                      <span className="pf-record-time">{item.period}</span>
                      <div className="pf-record-body">
                        <EditableText
                          as="div"
                          value={item.institution}
                          editMode={editMode}
                          onCommit={(v) =>
                            updateData((prev) => {
                              const arr = [...prev.records.education];
                              arr[idx] = { ...arr[idx], institution: v };
                              return { ...prev, records: { ...prev.records, education: arr } };
                            })
                          }
                        />
                        <span className="pf-record-role">{item.role}</span>
                        <EditableText
                          as="p"
                          className="pf-record-detail"
                          multiline
                          value={item.detail}
                          editMode={editMode}
                          onCommit={(v) =>
                            updateData((prev) => {
                              const arr = [...prev.records.education];
                              arr[idx] = { ...arr[idx], detail: v };
                              return { ...prev, records: { ...prev.records, education: arr } };
                            })
                          }
                        />
                      </div>
                    </li>
                  ))}
                </ul>

                <h3 style={{ marginTop: 32 }}>高校教学经历</h3>
                <ul className="pf-record-list">
                  {site.records.teaching.map((item, idx) => (
                    <li key={idx} className="pf-record-item">
                      <span className="pf-record-time">{item.period}</span>
                      <div className="pf-record-body">
                        <strong>{item.institution}</strong>
                        <span className="pf-record-role">{item.role}</span>
                        <EditableText
                          as="p"
                          className="pf-record-detail"
                          multiline
                          value={item.detail}
                          editMode={editMode}
                          onCommit={(v) =>
                            updateData((prev) => {
                              const arr = [...prev.records.teaching];
                              arr[idx] = { ...arr[idx], detail: v };
                              return { ...prev, records: { ...prev.records, teaching: arr } };
                            })
                          }
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 学术论文与展览 */}
              <div className="pf-record-group">
                <h3>学术论文与会议宣读</h3>
                <ul className="pf-record-list">
                  {site.records.papers.map((paper, idx) => (
                    <li key={paper.no + idx} className="pf-paper-item">
                      <span className="pf-paper-no">{paper.no}</span>
                      <div>
                        <EditableText
                          as="div"
                          multiline
                          value={paper.citation}
                          editMode={editMode}
                          onCommit={(v) =>
                            updateData((prev) => {
                              const arr = [...prev.records.papers];
                              arr[idx] = { ...arr[idx], citation: v };
                              return { ...prev, records: { ...prev.records, papers: arr } };
                            })
                          }
                        />
                      </div>
                    </li>
                  ))}
                </ul>

                <h3 style={{ marginTop: 32 }}>重要展览、电影节展映与荣誉</h3>
                <ul className="pf-record-list">
                  {site.records.exhibitions.map((ex, idx) => (
                    <li key={idx} className="pf-record-item">
                      <span className="pf-record-time">{ex.year}</span>
                      <div className="pf-record-body">
                        <EditableText
                          as="div"
                          value={ex.event}
                          editMode={editMode}
                          onCommit={(v) =>
                            updateData((prev) => {
                              const arr = [...prev.records.exhibitions];
                              arr[idx] = { ...arr[idx], event: v };
                              return { ...prev, records: { ...prev.records, exhibitions: arr } };
                            })
                          }
                        />
                        <EditableText
                          as="p"
                          className="pf-record-detail"
                          value={ex.work}
                          editMode={editMode}
                          onCommit={(v) =>
                            updateData((prev) => {
                              const arr = [...prev.records.exhibitions];
                              arr[idx] = { ...arr[idx], work: v };
                              return { ...prev, records: { ...prev.records, exhibitions: arr } };
                            })
                          }
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 作品总目录筛选条 */}
        <div className="pf-filter-bar" id="works">
          <div className="pf-container pf-filter-inner">
            <div className="pf-filter-tabs" role="tablist" aria-label="作品板块筛选">
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === "all"}
                className={`pf-filter-tab ${activeCategory === "all" ? "is-active" : ""}`}
                onClick={() => setActiveCategory("all")}
              >
                全部作品 ({projects.length})
              </button>
              {site.chapters.map((ch) => {
                const cnt = projects.filter((p) => p.categoryId === ch.id).length;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    role="tab"
                    aria-selected={activeCategory === ch.id}
                    className={`pf-filter-tab ${activeCategory === ch.id ? "is-active" : ""}`}
                    onClick={() => setActiveCategory(ch.id)}
                  >
                    {ch.roman} {ch.title} ({cnt})
                  </button>
                );
              })}
            </div>

            <div className="pf-view-switch" aria-label="视图切换">
              <button
                type="button"
                className={viewMode === "cards" ? "is-active" : ""}
                onClick={() => setViewMode("cards")}
              >
                画册视图
              </button>
              <button
                type="button"
                className={viewMode === "index" ? "is-active" : ""}
                onClick={() => setViewMode("index")}
              >
                紧凑目录
              </button>
            </div>
          </div>
        </div>

        {/* 三大章节作品陈列 */}
        {visibleChapters.map((chapter) => {
          const chProjects = projects.filter((p) => p.categoryId === chapter.id);
          return (
            <section
              key={chapter.id}
              id={`chapter-${chapter.id}`}
              className="pf-chapter-block"
              aria-labelledby={`chapter-title-${chapter.id}`}
            >
              <div className="pf-container">
                <div className="pf-chapter-lead">
                  <div>
                    <p className="pf-sec-kicker">
                      CHAPTER {chapter.roman} · 共 {chProjects.length} 项
                    </p>
                    <h2 id={`chapter-title-${chapter.id}`} className="pf-block-heading">
                      {chapter.roman} {chapter.title}
                    </h2>
                    <EditableText
                      as="p"
                      className="pf-block-desc"
                      multiline
                      value={chapter.description}
                      editMode={editMode}
                      onCommit={(v) =>
                        updateData((prev) => ({
                          ...prev,
                          chapters: prev.chapters.map((c) =>
                            c.id === chapter.id ? { ...c, description: v } : c
                          ),
                        }))
                      }
                    />
                    {chapter.notes && chapter.notes.length > 0 && (
                      <div className="pf-chapter-notes">
                        {chapter.notes.map((n, nIdx) => (
                          <p key={nIdx} style={{ margin: 0 }}>
                            {n}
                          </p>
                        ))}
                      </div>
                    )}
                    {chapter.tags && chapter.tags.length > 0 && (
                      <div className="pf-tags" style={{ marginTop: 16 }}>
                        {chapter.tags.map((tag) => (
                          <span key={tag} className="pf-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {chapter.dividerImage && (
                    <figure className="pf-chapter-divider-img">
                      <button
                        type="button"
                        onClick={() => openLightboxBySrc(chapter.dividerImage!.src)}
                        style={{ display: "block", width: "100%", padding: 0, cursor: "zoom-in" }}
                      >
                        <img
                          src={chapter.dividerImage.src}
                          alt={chapter.dividerImage.alt}
                          loading="lazy"
                        />
                      </button>
                      {chapter.dividerImage.caption && (
                        <figcaption className="pf-figure-caption">
                          <span>{chapter.dividerImage.caption}</span>
                        </figcaption>
                      )}
                    </figure>
                  )}
                </div>

                {viewMode === "cards" ? (
                  <div className="pf-cards-grid">
                    {chProjects.map((proj) => (
                      <Link
                        key={proj.slug}
                        href={`/portfolio/${proj.slug}/`}
                        className="pf-card"
                        prefetch={false}
                      >
                        <div className="pf-card-media">
                          <img
                            src={proj.heroImage.src}
                            alt={proj.heroImage.alt}
                            loading="lazy"
                          />
                          <span className="pf-card-theme-pill">
                            {THEME_BADGE[proj.theme]}
                          </span>
                        </div>
                        <div className="pf-card-body">
                          <div className="pf-card-meta">
                            <span>{proj.no}</span>
                            <span>{proj.year}</span>
                          </div>
                          <h3 className="pf-card-title">
                            <span>{proj.title}</span>
                            <ArrowDownRight size={18} aria-hidden="true" />
                          </h3>
                          <p className="pf-card-medium">{proj.medium}</p>
                          <p className="pf-card-summary">{proj.summary}</p>
                          <div className="pf-tags">
                            {proj.tags.slice(0, 4).map((t) => (
                              <span key={t} className="pf-tag">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="pf-index-table">
                    {chProjects.map((proj) => (
                      <Link
                        key={proj.slug}
                        href={`/portfolio/${proj.slug}/`}
                        className="pf-index-row"
                        prefetch={false}
                      >
                        <span className="pf-index-no">{proj.no}</span>
                        <span className="pf-index-title">{proj.title}</span>
                        <span className="pf-index-year">{proj.year}</span>
                        <span className="pf-index-med">{proj.medium}</span>
                        <span className="pf-index-enter">
                          查看专题 <ArrowDownRight size={14} aria-hidden="true" />
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}

        {/* 封底联系区 */}
        <section className="pf-contact-band" id="contact" aria-labelledby="pf-contact-title">
          <div className="pf-container">
            <div className="pf-contact-grid">
              <div>
                <p className="pf-sec-kicker">CLOSING · 联系与合作</p>
                <EditableText
                  as="h2"
                  value={site.contact.heading}
                  editMode={editMode}
                  onCommit={(v) =>
                    updateData((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, heading: v },
                    }))
                  }
                />
                <EditableText
                  as="p"
                  className="pf-block-desc"
                  multiline
                  value={site.contact.closing}
                  editMode={editMode}
                  onCommit={(v) =>
                    updateData((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, closing: v },
                    }))
                  }
                />
              </div>

              <div className="pf-contact-cards">
                <a className="pf-contact-item" href={`mailto:${site.contact.email}`}>
                  <div>
                    <span>电子邮箱 / EMAIL</span>
                    <strong>{site.contact.email}</strong>
                  </div>
                  <ArrowDownRight size={18} aria-hidden="true" />
                </a>

                <button type="button" className="pf-contact-item" onClick={handleCopyWechat}>
                  <div>
                    <span>微信 / WECHAT</span>
                    <strong>{site.contact.wechat}</strong>
                  </div>
                  {copyHint ? (
                    <Check size={18} aria-hidden="true" />
                  ) : (
                    <Copy size={18} aria-hidden="true" />
                  )}
                </button>
                {copyHint && (
                  <p role="status" className="pf-mono" style={{ margin: 0, fontSize: 12.5 }}>
                    {copyHint}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="pf-footer">
        <div className="pf-container pf-footer-inner">
          <span>© {new Date().getFullYear()} 任玄奇作品集 · 独立图文可编辑版</span>
          <div className="pf-footer-actions">
            <button
              type="button"
              className="pf-edit-trigger"
              onClick={() => setPortfolioEditUrl(!editMode)}
            >
              <Edit3 size={12} style={{ display: "inline", marginRight: 4 }} aria-hidden="true" />
              {editMode ? "退出排版编辑" : "编辑排版"}
            </button>
            <a href="#top">回到顶部 ↑</a>
          </div>
        </div>
      </footer>

      {editMode && (
        <EditToolbar
          targetLabel="src/data/portfolio2025/site.json"
          exportFilename="site.json"
          hasDraft={hasDraft}
          onDownload={downloadJson}
          getSerializedJson={getSerializedJson}
          onImportJson={importJsonText}
          onReset={resetDraft}
        />
      )}

      <Lightbox
        items={homeLightboxItems}
        activeIndex={lightboxIdx}
        onChangeIndex={setLightboxIdx}
        onClose={() => setLightboxIdx(null)}
      />
    </div>
  );
}
