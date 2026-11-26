"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Edit3, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import type { FolioPage, MediaItem, ProjectData } from "@/data/portfolio2025/schema";
import { EditToolbar } from "./EditToolbar";
import { FolioArtboard } from "./FolioArtboard";
import { Lightbox } from "./Lightbox";
import { setPortfolioEditUrl, usePortfolioDraft } from "./usePortfolioDraft";

type SpreadRow =
  | { kind: "double"; id: string; left: FolioPage; right: FolioPage; label: string; anchorNo: number }
  | { kind: "single"; id: string; page: FolioPage; label: string; anchorNo: number };

/** 按原始印前装订规则配对双面跨页（偶数页居左、奇数年次页居右，首尾落单页独立居中） */
function buildSpreads(pages: FolioPage[]): SpreadRow[] {
  const rows: SpreadRow[] = [];
  let i = 0;
  while (i < pages.length) {
    const curr = pages[i];
    const next = pages[i + 1];
    if (curr.pageNo % 2 === 0 && next && next.pageNo === curr.pageNo + 1) {
      rows.push({
        kind: "double",
        id: `spread-${curr.pageNo}-${next.pageNo}`,
        left: curr,
        right: next,
        label: `P${String(curr.pageNo).padStart(2, "0")}–${String(next.pageNo).padStart(2, "0")}`,
        anchorNo: curr.pageNo,
      });
      i += 2;
    } else {
      rows.push({
        kind: "single",
        id: `spread-${curr.pageNo}`,
        page: curr,
        label: `P${String(curr.pageNo).padStart(2, "0")}`,
        anchorNo: curr.pageNo,
      });
      i += 1;
    }
  }
  return rows;
}

export function ProjectDetailView({
  initialProject,
  prevProject,
  nextProject,
}: {
  initialProject: ProjectData;
  prevProject: ProjectData | null;
  nextProject: ProjectData | null;
}) {
  const {
    data: project,
    editMode,
    hasDraft,
    updateData,
    resetDraft,
    importJsonText,
    downloadJson,
    getSerializedJson,
  } = usePortfolioDraft<ProjectData>(`project:${initialProject.slug}`, initialProject);

  const [viewMode, setViewMode] = useState<"spread" | "single">("spread");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // 收集当前专题页内全部可放大图像（所有前景/连续拼贴图 + 全幅纯背景作品图）
  const allMedia = useMemo(() => {
    const list: MediaItem[] = [];
    const seen = new Set<string>();
    const push = (src: string, alt: string, caption?: string) => {
      if (!src || seen.has(src)) return;
      seen.add(src);
      list.push({ src, alt, caption });
    };

    for (const pg of project.pages) {
      if (pg.hidden) continue;
      for (const im of pg.images) {
        push(im.src, im.alt, im.caption || `${pg.label || ""} · ${im.alt}`);
      }
      if (pg.images.length === 0 && pg.bgImage) {
        push(pg.bgImage, `${project.title} ${pg.label || ""}`, pg.label);
      }
    }
    if (list.length === 0 && project.heroImage?.src) {
      push(project.heroImage.src, project.heroImage.alt, project.heroImage.caption);
    }
    return list;
  }, [project]);

  const openLightbox = (src: string) => {
    const idx = allMedia.findIndex((m) => m.src === src);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  const handleChangePage = (idx: number, nextPage: FolioPage) => {
    updateData((prev) => {
      const nextPages = [...prev.pages];
      nextPages[idx] = nextPage;
      return { ...prev, pages: nextPages };
    });
  };

  const handleMovePage = (idx: number, delta: -1 | 1) => {
    updateData((prev) => {
      const target = idx + delta;
      if (target < 0 || target >= prev.pages.length) return prev;
      const nextPages = [...prev.pages];
      [nextPages[idx], nextPages[target]] = [nextPages[target], nextPages[idx]];
      return { ...prev, pages: nextPages };
    });
  };

  const visiblePages = useMemo(
    () => project.pages.filter((p) => !p.hidden || editMode),
    [project.pages, editMode]
  );

  const spreads = useMemo(() => buildSpreads(visiblePages), [visiblePages]);
  const hasDoubleSpreads = useMemo(
    () => spreads.some((s) => s.kind === "double"),
    [spreads]
  );
  const pageIndexById = useMemo(
    () => new Map(project.pages.map((p, i) => [p.id, i])),
    [project.pages]
  );

  return (
    <div className="pf-root" data-theme={project.theme}>
      <a className="pf-skip" href="#project-folio">
        跳到作品正文
      </a>

      <header className="pf-header">
        <div className="pf-container pf-header-inner">
          <div className="pf-header-left">
            <Link className="pf-back-link" href="/portfolio/" prefetch={false}>
              <ArrowLeft size={16} aria-hidden="true" />
              <span>返回作品总览</span>
            </Link>
            <span className="pf-mono pf-hide-xs" style={{ fontSize: 12, color: "var(--pf-faint)" }}>
              {project.categoryLabel} / {project.no}
            </span>
          </div>

          <div className="pf-header-left" style={{ gap: 8 }}>
            <Link className="pf-home-btn" href="/" prefetch={false}>
              返回首页
            </Link>
            {prevProject && (
              <Link
                className="pf-home-btn"
                href={`/portfolio/${prevProject.slug}/`}
                prefetch={false}
                title={`上一件：${prevProject.title}`}
              >
                <ChevronLeft size={14} aria-hidden="true" />
                <span>上一件</span>
              </Link>
            )}
            {nextProject && (
              <Link
                className="pf-home-btn"
                href={`/portfolio/${nextProject.slug}/`}
                prefetch={false}
                title={`下一件：${nextProject.title}`}
              >
                <span>下一件</span>
                <ChevronRight size={14} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <main id="project-folio">
        {/* 专题页简洁导览头 */}
        <section className="pf-project-hero pf-project-hero--compact">
          <div className="pf-container">
            <div className="pf-project-hero-top">
              <div>
                <div className="pf-project-code">
                  <span>{project.no}</span>
                  <span>/</span>
                  <span>{project.categoryLabel}</span>
                  <span>·</span>
                  <span>{project.year}</span>
                  <span>·</span>
                  <span>共 {project.pages.length} 个原版画页</span>
                </div>
                <h1>{project.title}</h1>
                {project.subtitle && (
                  <p className="pf-project-subtitle">{project.subtitle}</p>
                )}
              </div>

              <div>
                <p className="pf-project-summary">{project.summary}</p>
                <div className="pf-tags">
                  {project.tags.map((tag, idx) => (
                    <span key={tag + idx} className="pf-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pf-folio-toolbar">
              <div className="pf-page-pills" aria-label="原稿页码快速跳转">
                {viewMode === "spread" && !editMode
                  ? spreads.map((sp) => (
                      <a
                        key={sp.id}
                        href={`#folio-page-${sp.anchorNo}`}
                        className="pf-page-pill"
                      >
                        {sp.label}
                      </a>
                    ))
                  : visiblePages.map((pg) => (
                      <a
                        key={pg.id}
                        href={`#folio-page-${pg.pageNo}`}
                        className="pf-page-pill"
                      >
                        P{String(pg.pageNo).padStart(2, "0")}
                      </a>
                    ))}
              </div>

              <div className="pf-view-switch" aria-label="版式切换">
                <button
                  type="button"
                  className={viewMode === "spread" ? "is-active" : ""}
                  onClick={() => setViewMode("spread")}
                >
                  <BookOpen size={13} aria-hidden="true" />
                  <span>对页阅读</span>
                </button>
                <button
                  type="button"
                  className={viewMode === "single" ? "is-active" : ""}
                  onClick={() => setViewMode("single")}
                >
                  <FileText size={13} aria-hidden="true" />
                  <span>单页阅读</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 主体区域：对页合订原版画册 或 单页竖向连读 / 编辑模式 */}
        <section className="pf-folio-stage">
          <div
            className={`pf-container pf-folio-container ${
              viewMode === "spread" && !editMode ? "pf-folio-container--spread" : ""
            }`}
          >
            {viewMode === "spread" && !editMode ? (
              <div className="pf-spread-stack">
                {spreads.map((sp) =>
                  sp.kind === "double" ? (
                    <div key={sp.id} className="pf-double-spread">
                      {[sp.left, sp.right].map((pg) => {
                        const idx = pageIndexById.get(pg.id) ?? 0;
                        return (
                          <FolioArtboard
                            key={pg.id}
                            page={pg}
                            pageIndex={idx}
                            totalPages={project.pages.length}
                            editMode={false}
                            onChangePage={(next) => handleChangePage(idx, next)}
                            onMovePage={(delta) => handleMovePage(idx, delta)}
                            onOpenLightbox={openLightbox}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      key={sp.id}
                      className={hasDoubleSpreads ? "pf-single-in-spread" : "pf-single-solo"}
                    >
                      {(() => {
                        const idx = pageIndexById.get(sp.page.id) ?? 0;
                        return (
                          <FolioArtboard
                            page={sp.page}
                            pageIndex={idx}
                            totalPages={project.pages.length}
                            editMode={false}
                            onChangePage={(next) => handleChangePage(idx, next)}
                            onMovePage={(delta) => handleMovePage(idx, delta)}
                            onOpenLightbox={openLightbox}
                          />
                        );
                      })()}
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="pf-artboard-stack">
                {visiblePages.map((pg) => {
                  const idx = pageIndexById.get(pg.id) ?? 0;
                  return (
                    <FolioArtboard
                      key={pg.id}
                      page={pg}
                      pageIndex={idx}
                      totalPages={project.pages.length}
                      editMode={editMode}
                      onChangePage={(next) => handleChangePage(idx, next)}
                      onMovePage={(delta) => handleMovePage(idx, delta)}
                      onOpenLightbox={openLightbox}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 上下件翻页 */}
        <nav className="pf-container pf-pager" aria-label="上下作品导航">
          {prevProject ? (
            <Link
              href={`/portfolio/${prevProject.slug}/`}
              className="pf-pager-link"
              prefetch={false}
            >
              <span className="pf-pager-dir">
                <ChevronLeft size={14} aria-hidden="true" />
                上一件 · {prevProject.no}
              </span>
              <span className="pf-pager-title">{prevProject.title}</span>
            </Link>
          ) : (
            <div />
          )}

          {nextProject ? (
            <Link
              href={`/portfolio/${nextProject.slug}/`}
              className="pf-pager-link pf-pager-link--next"
              prefetch={false}
            >
              <span className="pf-pager-dir">
                下一件 · {nextProject.no}
                <ChevronRight size={14} aria-hidden="true" />
              </span>
              <span className="pf-pager-title">{nextProject.title}</span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </main>

      <footer className="pf-footer">
        <div className="pf-container pf-footer-inner">
          <span>
            {project.no} · 《{project.title}》 · 1:1 原版构图可编辑档案
          </span>
          <div className="pf-footer-actions">
            <button
              type="button"
              className="pf-edit-trigger"
              onClick={() => setPortfolioEditUrl(!editMode)}
            >
              <Edit3 size={12} style={{ display: "inline", marginRight: 4 }} aria-hidden="true" />
              {editMode ? "退出排版编辑" : "编辑此作品"}
            </button>
            <Link href="/portfolio/" prefetch={false}>
              返回总目录
            </Link>
            <a href="#project-folio">回到顶部 ↑</a>
          </div>
        </div>
      </footer>

      {editMode && (
        <EditToolbar
          targetLabel={`src/data/portfolio2025/projects/${project.slug}.json`}
          exportFilename={`${project.slug}.json`}
          hasDraft={hasDraft}
          onDownload={downloadJson}
          getSerializedJson={getSerializedJson}
          onImportJson={importJsonText}
          onReset={resetDraft}
        />
      )}

      <Lightbox
        items={allMedia}
        activeIndex={lightboxIndex}
        onChangeIndex={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </div>
  );
}
