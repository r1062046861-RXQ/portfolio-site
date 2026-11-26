"use client";

import { Check, Copy, Download, RotateCcw, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { setPortfolioEditUrl } from "./usePortfolioDraft";

export function EditToolbar({
  targetLabel,
  exportFilename,
  hasDraft,
  onDownload,
  getSerializedJson,
  onImportJson,
  onReset,
}: {
  targetLabel: string;
  exportFilename: string;
  hasDraft: boolean;
  onDownload: (filename: string) => void;
  getSerializedJson: () => string;
  onImportJson: (jsonText: string) => { ok: boolean; error?: string };
  onReset: () => void;
}) {
  const [status, setStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getSerializedJson());
      setStatus("已复制 JSON");
    } catch {
      setStatus("复制失败，请使用导出 JSON");
    }
    window.setTimeout(() => setStatus(""), 2600);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = onImportJson(text);
    setStatus(res.ok ? `已载入 ${file.name}` : `导入失败：${res.error}`);
    event.target.value = "";
    window.setTimeout(() => setStatus(""), 3200);
  };

  return (
    <aside className="pf-edit-toolbar" aria-label="网页排版编辑工具栏">
      <div className="pf-edit-toolbar-info">
        <span className="pf-edit-badge">编辑模式</span>
        <span className="pf-edit-target" title={targetLabel}>
          正在编辑：<code>{targetLabel}</code>
        </span>
        {hasDraft && <span className="pf-edit-dirty">已暂存本地修改</span>}
        {status && (
          <span className="pf-edit-status" role="status">
            <Check size={14} aria-hidden="true" />
            {status}
          </span>
        )}
      </div>

      <div className="pf-edit-toolbar-actions">
        <button
          type="button"
          className="pf-edit-btn pf-edit-btn--primary"
          onClick={() => {
            onDownload(exportFilename);
            setStatus(`已导出 ${exportFilename}`);
            window.setTimeout(() => setStatus(""), 2600);
          }}
        >
          <Download size={14} aria-hidden="true" />
          <span>导出 JSON</span>
        </button>

        <button type="button" className="pf-edit-btn" onClick={handleCopy}>
          <Copy size={14} aria-hidden="true" />
          <span>复制 JSON</span>
        </button>

        <button
          type="button"
          className="pf-edit-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={14} aria-hidden="true" />
          <span>导入 JSON</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={handleFileChange}
        />

        <button
          type="button"
          className="pf-edit-btn"
          onClick={() => {
            onReset();
            setStatus("已还原默认数据");
            window.setTimeout(() => setStatus(""), 2600);
          }}
          disabled={!hasDraft}
        >
          <RotateCcw size={14} aria-hidden="true" />
          <span>重置原版</span>
        </button>

        <button
          type="button"
          className="pf-edit-btn pf-edit-btn--ghost"
          onClick={() => setPortfolioEditUrl(false)}
        >
          <X size={14} aria-hidden="true" />
          <span>退出编辑</span>
        </button>
      </div>
    </aside>
  );
}
