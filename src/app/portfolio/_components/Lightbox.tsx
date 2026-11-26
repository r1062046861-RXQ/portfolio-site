"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { MediaItem } from "@/data/portfolio2025/schema";

export function Lightbox({
  items,
  activeIndex,
  onChangeIndex,
  onClose,
}: {
  items: MediaItem[];
  activeIndex: number | null;
  onChangeIndex: (next: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const isOpen = activeIndex !== null && items.length > 0;
  const safeIndex = activeIndex !== null ? ((activeIndex % items.length) + items.length) % items.length : 0;
  const current = isOpen ? items[safeIndex] : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!triggerRef.current && document.activeElement instanceof HTMLElement) {
        triggerRef.current = document.activeElement;
      }
      const prevOverflow = document.documentElement.style.overflow;
      if (!dialog.open) dialog.showModal();
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = prevOverflow;
      };
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    if (triggerRef.current) {
      triggerRef.current.focus({ preventScroll: true });
      triggerRef.current = null;
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="pf-lightbox"
      aria-label="作品高清大图预览"
      onClose={handleClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
      onKeyDown={(event) => {
        if (!isOpen) return;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          onChangeIndex((safeIndex - 1 + items.length) % items.length);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          onChangeIndex((safeIndex + 1) % items.length);
        }
      }}
    >
      {current && (
        <div className="pf-lightbox-inner">
          <div className="pf-lightbox-bar">
            <span className="pf-mono pf-lightbox-count">
              {String(safeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              {current.code ? ` · ${current.code}` : ""}
            </span>
            <button
              type="button"
              className="pf-lightbox-close"
              onClick={handleClose}
              autoFocus
              aria-label="关闭大图预览"
            >
              <span>关闭</span>
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <figure className="pf-lightbox-stage">
            <img src={current.src} alt={current.alt} />
            {(current.caption || current.alt) && (
              <figcaption>{current.caption || current.alt}</figcaption>
            )}
          </figure>

          {items.length > 1 && (
            <div className="pf-lightbox-nav">
              <button
                type="button"
                onClick={() => onChangeIndex((safeIndex - 1 + items.length) % items.length)}
                aria-label="上一张"
              >
                <ChevronLeft size={18} aria-hidden="true" />
                <span>上一张</span>
              </button>
              <span className="pf-lightbox-hint">← → 切换 · Esc 关闭</span>
              <button
                type="button"
                onClick={() => onChangeIndex((safeIndex + 1) % items.length)}
                aria-label="下一张"
              >
                <span>下一张</span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
