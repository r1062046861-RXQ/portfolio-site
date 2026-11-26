"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  ImagePlus,
  Layers,
  Move,
  Plus,
  Trash2,
  Type,
} from "lucide-react";
import { useRef, useState } from "react";
import type {
  FolioImageLayer,
  FolioPage,
  FolioTextLayer,
} from "@/data/portfolio2025/schema";

type Selection =
  | { kind: "image"; id: string }
  | { kind: "text"; id: string }
  | null;

const FONT_MAP: Record<FolioTextLayer["fontFamily"], string> = {
  sans: 'var(--font-geist-sans), "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  serif: '"STZhongsong", "华文中宋", "Songti SC", "Noto Serif SC", Georgia, serif',
  mono: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Consolas, monospace",
};

function clampNum(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number(val.toFixed(2))));
}

export function FolioArtboard({
  page,
  pageIndex,
  totalPages,
  editMode,
  onChangePage,
  onMovePage,
  onOpenLightbox,
}: {
  page: FolioPage;
  pageIndex: number;
  totalPages: number;
  editMode: boolean;
  onChangePage: (next: FolioPage) => void;
  onMovePage: (delta: -1 | 1) => void;
  onOpenLightbox: (src: string) => void;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Selection>(null);

  if (page.hidden && !editMode) {
    return null;
  }

  const activeImg =
    selected?.kind === "image"
      ? page.images.find((i) => i.id === selected.id) ?? null
      : null;
  const activeTxt =
    selected?.kind === "text"
      ? page.texts.find((t) => t.id === selected.id) ?? null
      : null;

  const startPointerDrag = (
    event: React.PointerEvent,
    kind: "image" | "text",
    id: string,
    mode: "move" | "resize"
  ) => {
    if (!editMode || !boardRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    setSelected({ kind, id });

    const rect = boardRef.current.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const item =
      kind === "image"
        ? page.images.find((i) => i.id === id)
        : page.texts.find((t) => t.id === id);
    if (!item) return;

    const origX = item.x;
    const origY = item.y;
    const origW = item.w;
    const origH = item.h;

    const onMove = (ev: PointerEvent) => {
      const dxPct = ((ev.clientX - startX) / Math.max(1, rect.width)) * 100;
      const dyPct = ((ev.clientY - startY) / Math.max(1, rect.height)) * 100;

      if (kind === "image") {
        onChangePage({
          ...page,
          images: page.images.map((im) => {
            if (im.id !== id) return im;
            if (mode === "move") {
              return {
                ...im,
                x: clampNum(origX + dxPct, 0, 100 - origW),
                y: clampNum(origY + dyPct, 0, 100 - origH),
              };
            }
            return {
              ...im,
              w: clampNum(origW + dxPct, 2, 100 - origX),
              h: clampNum(origH + dyPct, 2, 100 - origY),
            };
          }),
        });
      } else {
        onChangePage({
          ...page,
          texts: page.texts.map((tx) => {
            if (tx.id !== id) return tx;
            if (mode === "move") {
              return {
                ...tx,
                x: clampNum(origX + dxPct, 0, 96),
                y: clampNum(origY + dyPct, 0, 96),
              };
            }
            return {
              ...tx,
              w: clampNum(origW + dxPct, 3, 100 - origX),
              h: clampNum(origH + dyPct, 2, 100 - origY),
            };
          }),
        });
      }
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const addTextBox = () => {
    const newId = `${page.id}-t-${Date.now().toString().slice(-4)}`;
    const newText: FolioTextLayer = {
      id: newId,
      text: "双击输入文字内容",
      x: 8,
      y: 8,
      w: 24,
      h: 6,
      z: page.texts.length + 1,
      fontSizePt: 13,
      lineHeight: 1.5,
      color: "#231f20",
      fontFamily: "sans",
      fontWeight: 500,
      align: "left",
      rotation: 0,
    };
    onChangePage({ ...page, texts: [...page.texts, newText] });
    setSelected({ kind: "text", id: newId });
  };

  const addImageBox = () => {
    const fallbackSrc =
      page.images[0]?.src ||
      page.bgImage ||
      "/portfolio-2025/meta/cover-fluid.webp";
    const newId = `${page.id}-i-${Date.now().toString().slice(-4)}`;
    const newImg: FolioImageLayer = {
      id: newId,
      src: fallbackSrc,
      x: 10,
      y: 10,
      w: 28,
      h: 28,
      z: page.images.length + 1,
      kind: "single",
      alt: "新增图片图层",
      caption: "",
    };
    onChangePage({ ...page, images: [...page.images, newImg] });
    setSelected({ kind: "image", id: newId });
  };

  const continuousCount = page.images.filter(
    (im) => im.kind === "continuous-group"
  ).length;

  return (
    <article
      id={`folio-page-${page.pageNo}`}
      className={`pf-spread-wrap ${page.hidden ? "is-hidden-page" : ""}`}
    >
      {/* 仅编辑模式展示单页图层控制栏，访客视图保持纯净跨页原貌 */}
      {editMode && (
        <div className="pf-spread-meta">
          <div className="pf-spread-meta-left">
            <span className="pf-mono pf-spread-no">
              {page.label || `原稿 P${String(page.pageNo).padStart(2, "0")}`}
            </span>
            <span className="pf-spread-chips">
              {continuousCount > 0 && (
                <span className="pf-spread-chip">
                  {continuousCount} 组连续拼贴完整保留
                </span>
              )}
              <span className="pf-spread-chip">
                {page.images.length} 图层 · {page.texts.length} 段可选文字
              </span>
            </span>
          </div>

          <div className="pf-spread-actions">
            <button type="button" className="pf-edit-pill" onClick={addTextBox}>
              <Plus size={12} aria-hidden="true" /> 加文字
            </button>
            <button type="button" className="pf-edit-pill" onClick={addImageBox}>
              <ImagePlus size={12} aria-hidden="true" /> 加图片
            </button>
            <button
              type="button"
              className="pf-edit-pill"
              disabled={pageIndex === 0}
              onClick={() => onMovePage(-1)}
              title="本页上移"
            >
              <ArrowUp size={12} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="pf-edit-pill"
              disabled={pageIndex === totalPages - 1}
              onClick={() => onMovePage(1)}
              title="本页下移"
            >
              <ArrowDown size={12} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="pf-edit-pill"
              onClick={() => onChangePage({ ...page, hidden: !page.hidden })}
              title={page.hidden ? "恢复显示本页" : "隐藏本页"}
            >
              {page.hidden ? <Eye size={12} aria-hidden="true" /> : <EyeOff size={12} aria-hidden="true" />}
              <span>{page.hidden ? "已隐藏" : "隐藏"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 编辑模式选中图层属性工具条 */}
      {editMode && (activeTxt || activeImg) && (
        <div className="pf-layer-inspector" role="region" aria-label="当前图层属性调节">
          {activeTxt && (
            <>
              <span className="pf-mono pf-inspector-tag">
                <Type size={12} aria-hidden="true" /> 文字层 · x:{activeTxt.x.toFixed(1)}% y:{activeTxt.y.toFixed(1)}%
              </span>
              <button
                type="button"
                className="pf-edit-pill"
                onClick={() =>
                  onChangePage({
                    ...page,
                    texts: page.texts.map((t) =>
                      t.id === activeTxt.id
                        ? { ...t, fontSizePt: clampNum(t.fontSizePt - 1, 6, 96) }
                        : t
                    ),
                  })
                }
              >
                A-
              </button>
              <span className="pf-mono" style={{ fontSize: 11.5 }}>
                {activeTxt.fontSizePt}pt
              </span>
              <button
                type="button"
                className="pf-edit-pill"
                onClick={() =>
                  onChangePage({
                    ...page,
                    texts: page.texts.map((t) =>
                      t.id === activeTxt.id
                        ? { ...t, fontSizePt: clampNum(t.fontSizePt + 1, 6, 96) }
                        : t
                    ),
                  })
                }
              >
                A+
              </button>
              <button
                type="button"
                className="pf-edit-pill"
                onClick={() =>
                  onChangePage({
                    ...page,
                    texts: page.texts.map((t) =>
                      t.id === activeTxt.id
                        ? { ...t, fontWeight: t.fontWeight >= 600 ? 400 : 600 }
                        : t
                    ),
                  })
                }
              >
                {activeTxt.fontWeight >= 600 ? "细体" : "加粗"}
              </button>
              <label className="pf-color-pick" title="文字颜色">
                <span>色</span>
                <input
                  type="color"
                  value={activeTxt.color}
                  onChange={(e) =>
                    onChangePage({
                      ...page,
                      texts: page.texts.map((t) =>
                        t.id === activeTxt.id ? { ...t, color: e.target.value } : t
                      ),
                    })
                  }
                />
              </label>
              <button
                type="button"
                className="pf-edit-pill"
                onClick={() =>
                  onChangePage({
                    ...page,
                    texts: page.texts.map((t) =>
                      t.id === activeTxt.id ? { ...t, align: "left" } : t
                    ),
                  })
                }
                aria-label="左对齐"
              >
                <AlignLeft size={12} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="pf-edit-pill"
                onClick={() =>
                  onChangePage({
                    ...page,
                    texts: page.texts.map((t) =>
                      t.id === activeTxt.id ? { ...t, align: "center" } : t
                    ),
                  })
                }
                aria-label="居中对齐"
              >
                <AlignCenter size={12} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="pf-edit-pill"
                onClick={() =>
                  onChangePage({
                    ...page,
                    texts: page.texts.map((t) =>
                      t.id === activeTxt.id ? { ...t, align: "right" } : t
                    ),
                  })
                }
                aria-label="右对齐"
              >
                <AlignRight size={12} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="pf-edit-pill pf-edit-pill--danger"
                onClick={() => {
                  onChangePage({
                    ...page,
                    texts: page.texts.filter((t) => t.id !== activeTxt.id),
                  });
                  setSelected(null);
                }}
              >
                <Trash2 size={12} aria-hidden="true" /> 删除
              </button>
            </>
          )}

          {activeImg && (
            <>
              <span className="pf-mono pf-inspector-tag">
                <Layers size={12} aria-hidden="true" />{" "}
                {activeImg.kind === "continuous-group"
                  ? `连续拼贴 (${activeImg.tileCount || "多"} 切片)`
                  : "独立图"}{" "}
                · x:{activeImg.x.toFixed(1)}% y:{activeImg.y.toFixed(1)}%
              </span>
              <input
                type="text"
                className="pf-inspector-input"
                aria-label="图片路径"
                value={activeImg.src}
                onChange={(e) =>
                  onChangePage({
                    ...page,
                    images: page.images.map((im) =>
                      im.id === activeImg.id ? { ...im, src: e.target.value } : im
                    ),
                  })
                }
                placeholder="/portfolio-2025/..."
              />
              <input
                type="text"
                className="pf-inspector-input"
                aria-label="图片说明"
                value={activeImg.caption || ""}
                onChange={(e) =>
                  onChangePage({
                    ...page,
                    images: page.images.map((im) =>
                      im.id === activeImg.id ? { ...im, caption: e.target.value } : im
                    ),
                  })
                }
                placeholder="图片说明（选填）"
              />
              <button
                type="button"
                className="pf-edit-pill"
                onClick={() =>
                  onChangePage({
                    ...page,
                    images: page.images.map((im) =>
                      im.id === activeImg.id ? { ...im, z: im.z + 1 } : im
                    ),
                  })
                }
                title="上移一层"
              >
                置前
              </button>
              <button
                type="button"
                className="pf-edit-pill"
                onClick={() => {
                  const cloneId = `${activeImg.id}-copy`;
                  onChangePage({
                    ...page,
                    images: [
                      ...page.images,
                      {
                        ...activeImg,
                        id: cloneId,
                        x: clampNum(activeImg.x + 2, 0, 92),
                        y: clampNum(activeImg.y + 2, 0, 92),
                        z: page.images.length + 1,
                      },
                    ],
                  });
                  setSelected({ kind: "image", id: cloneId });
                }}
              >
                <Copy size={12} aria-hidden="true" /> 复制
              </button>
              <button
                type="button"
                className="pf-edit-pill pf-edit-pill--danger"
                onClick={() => {
                  onChangePage({
                    ...page,
                    images: page.images.filter((im) => im.id !== activeImg.id),
                  });
                  setSelected(null);
                }}
              >
                <Trash2 size={12} aria-hidden="true" /> 删除
              </button>
            </>
          )}
        </div>
      )}

      {/* 1:1 画册比例舞台 */}
      <div
        ref={boardRef}
        className={`pf-artboard ${editMode ? "is-edit" : ""}`}
        style={{
          aspectRatio: `${page.widthPt} / ${page.heightPt}`,
          backgroundColor: page.bgColor,
        }}
        onClick={() => {
          if (editMode) {
            setSelected(null);
          } else if (page.images.length === 0 && page.bgImage) {
            onOpenLightbox(page.bgImage);
          }
        }}
      >
        {/* 1. 纯装饰底版层（含底纹/斜线/圆点/分栏线/全幅底图） */}
        {page.bgImage && (
          <img
            src={page.bgImage}
            alt=""
            aria-hidden="true"
            className="pf-ab-bg"
            loading={pageIndex < 4 ? "eager" : "lazy"}
            decoding="async"
          />
        )}

        {/* 2. 前景图 & 连续拼贴图组层 */}
        {page.images.map((img) => {
          const isSel = editMode && selected?.kind === "image" && selected.id === img.id;
          return (
            <div
              key={img.id}
              className={`pf-ab-image ${isSel ? "is-selected" : ""}`}
              style={{
                left: `${img.x}%`,
                top: `${img.y}%`,
                width: `${img.w}%`,
                height: `${img.h}%`,
                zIndex: img.z,
              }}
              onClick={(ev) => {
                ev.stopPropagation();
                if (editMode) {
                  setSelected({ kind: "image", id: img.id });
                } else {
                  onOpenLightbox(img.src);
                }
              }}
              onPointerDown={(ev) => {
                if (!editMode) return;
                startPointerDrag(ev, "image", img.id, "move");
              }}
              role={editMode ? undefined : "button"}
              tabIndex={editMode ? undefined : 0}
              aria-label={editMode ? undefined : `放大查看：${img.caption || img.alt}`}
              onKeyDown={(ev) => {
                if (!editMode && (ev.key === "Enter" || ev.key === " ")) {
                  ev.preventDefault();
                  onOpenLightbox(img.src);
                }
              }}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading={pageIndex < 4 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
              />
              {editMode && isSel && (
                <>
                  <span className="pf-ab-tag">
                    <Move size={10} aria-hidden="true" />
                    {img.kind === "continuous-group" ? "连续拼贴" : "图"}
                  </span>
                  <button
                    type="button"
                    className="pf-ab-resize"
                    aria-label="缩放图片尺寸"
                    onPointerDown={(ev) => startPointerDrag(ev, "image", img.id, "resize")}
                  />
                </>
              )}
            </div>
          );
        })}

        {/* 3. 100% 真实 DOM 可选中可编辑文字层 */}
        {page.texts.map((txt) => {
          const isSel = editMode && selected?.kind === "text" && selected.id === txt.id;
          const rot = txt.rotation || 0;
          const isVert = rot !== 0;
          const isSingle = Boolean(txt.singleLine) && !editMode && !isVert;

          const baseStyle: React.CSSProperties = {
            top: `${txt.y}%`,
            zIndex: 20 + txt.z,
            fontSize: `calc(${txt.fontSizePt} / ${page.widthPt} * 100cqw)`,
            lineHeight: txt.lineHeight,
            color: txt.color,
            fontFamily: FONT_MAP[txt.fontFamily],
            fontWeight: txt.fontWeight,
            textAlign: txt.align,
          };

          if (isVert) {
            baseStyle.left = `${txt.x}%`;
            baseStyle.writingMode = "vertical-rl";
            baseStyle.maxHeight = `${Math.min(100 - txt.y, txt.h + 2.5)}%`;
            if (rot === -90) {
              baseStyle.transform = "rotate(180deg)";
            }
          } else if (isSingle) {
            baseStyle.whiteSpace = "nowrap";
            baseStyle.width = "max-content";
            if (txt.anchorRight && typeof txt.rightPct === "number") {
              baseStyle.right = `${txt.rightPct}%`;
            } else {
              baseStyle.left = `${txt.x}%`;
            }
          } else {
            baseStyle.left = `${txt.x}%`;
            baseStyle.width = `${txt.w}%`;
          }

          if (!isVert && txt.textIndentEm) {
            baseStyle.textIndent = `${txt.textIndentEm}em`;
          }

          return (
            <div
              key={txt.id}
              className={`pf-ab-text ${isSel ? "is-selected" : ""} ${isSingle ? "is-single-line" : ""}`}
              style={baseStyle}
              onClick={(ev) => {
                if (!editMode) return;
                ev.stopPropagation();
                setSelected({ kind: "text", id: txt.id });
              }}
            >
              {editMode && isSel && (
                <>
                  <button
                    type="button"
                    className="pf-ab-drag-handle"
                    aria-label="拖拽移动文本框"
                    onPointerDown={(ev) => startPointerDrag(ev, "text", txt.id, "move")}
                  >
                    <Move size={10} aria-hidden="true" /> 移动
                  </button>
                  <button
                    type="button"
                    className="pf-ab-resize"
                    aria-label="调整文本框宽度"
                    onPointerDown={(ev) => startPointerDrag(ev, "text", txt.id, "resize")}
                  />
                </>
              )}

              {editMode ? (
                <div
                  className="pf-ab-text-inner is-editable"
                  contentEditable
                  suppressContentEditableWarning
                  onFocus={() => setSelected({ kind: "text", id: txt.id })}
                  onBlur={(ev) => {
                    const nextVal = ev.currentTarget.innerText.replace(/\r\n/g, "\n");
                    if (nextVal !== txt.text) {
                      onChangePage({
                        ...page,
                        texts: page.texts.map((t) =>
                          t.id === txt.id ? { ...t, text: nextVal } : t
                        ),
                      });
                    }
                  }}
                >
                  {txt.text}
                </div>
              ) : (
                <div className="pf-ab-text-inner">{txt.text}</div>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}
