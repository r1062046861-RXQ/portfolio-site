"use client";

import type { CSSProperties, KeyboardEvent } from "react";

type TagName = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div" | "strong" | "blockquote";

export function EditableText({
  as = "p",
  value,
  editMode,
  onCommit,
  className,
  style,
  multiline = false,
  placeholder,
}: {
  as?: TagName;
  value: string;
  editMode: boolean;
  onCommit: (nextValue: string) => void;
  className?: string;
  style?: CSSProperties;
  multiline?: boolean;
  placeholder?: string;
}) {
  const Tag = as;

  if (!editMode) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    const raw = event.currentTarget.innerText;
    const normalized = multiline ? raw.replace(/\r\n/g, "\n").trim() : raw.replace(/\s+/g, " ").trim();
    if (normalized !== value) {
      onCommit(normalized || value);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!multiline && event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  return (
    <Tag
      className={[className, "pf-editable"].filter(Boolean).join(" ")}
      style={style}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {value}
    </Tag>
  );
}
