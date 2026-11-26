"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_PREFIX = "rxq-portfolio-2025-draft:v1:";
const DRAFT_EVENT = "rxq-pf-draft-change";
const EDIT_EVENT = "rxq-pf-edit-change";

const rawCache = new Map<string, string | null>();
const parsedCache = new Map<string, unknown>();

function subscribeEditMode(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(EDIT_EVENT, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(EDIT_EVENT, callback);
  };
}

function getEditSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("edit") === "1" || params.get("edit") === "true";
}

function getServerEditSnapshot(): boolean {
  return false;
}

export function setPortfolioEditUrl(enabled: boolean): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (enabled) {
    url.searchParams.set("edit", "1");
  } else {
    url.searchParams.delete("edit");
  }
  window.history.replaceState({}, "", url.toString());
  window.dispatchEvent(new Event(EDIT_EVENT));
}

function readCachedDraft<T>(storageKey: string, initialData: T): { data: T; hasDraft: boolean } {
  if (typeof window === "undefined") {
    return { data: initialData, hasDraft: false };
  }
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(storageKey);
  } catch {
    raw = null;
  }

  if (raw === null) {
    rawCache.delete(storageKey);
    parsedCache.delete(storageKey);
    return { data: initialData, hasDraft: false };
  }

  if (rawCache.get(storageKey) === raw && parsedCache.has(storageKey)) {
    return { data: parsedCache.get(storageKey) as T, hasDraft: true };
  }

  try {
    const parsed = JSON.parse(raw) as T;
    rawCache.set(storageKey, raw);
    parsedCache.set(storageKey, parsed);
    return { data: parsed, hasDraft: true };
  } catch {
    rawCache.delete(storageKey);
    parsedCache.delete(storageKey);
    return { data: initialData, hasDraft: false };
  }
}

export function usePortfolioDraft<T>(draftId: string, initialData: T) {
  const storageKey = STORAGE_PREFIX + draftId;
  const editMode = useSyncExternalStore(subscribeEditMode, getEditSnapshot, getServerEditSnapshot);

  const subscribeDraft = useCallback(
    (callback: () => void) => {
      const onStorage = (ev: StorageEvent) => {
        if (!ev.key || ev.key === storageKey) callback();
      };
      const onCustom = (ev: Event) => {
        const detail = (ev as CustomEvent<string>).detail;
        if (!detail || detail === storageKey) callback();
      };
      window.addEventListener("storage", onStorage);
      window.addEventListener(DRAFT_EVENT, onCustom);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(DRAFT_EVENT, onCustom);
      };
    },
    [storageKey]
  );

  const getRawSnapshot = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }, [storageKey]);

  const getServerRawSnapshot = useCallback((): string | null => null, []);
  const rawString = useSyncExternalStore(subscribeDraft, getRawSnapshot, getServerRawSnapshot);

  const { data, hasDraft } = useMemo(() => {
    if (rawString === null) return { data: initialData, hasDraft: false };
    return readCachedDraft(storageKey, initialData);
  }, [rawString, storageKey, initialData]);

  const updateData = useCallback(
    (updater: (prev: T) => T) => {
      const current = readCachedDraft(storageKey, initialData).data;
      const next = updater(current);
      const serialized = JSON.stringify(next, null, 2);
      try {
        window.localStorage.setItem(storageKey, serialized);
        rawCache.set(storageKey, serialized);
        parsedCache.set(storageKey, next);
      } catch {
        // Ignore quota errors while keeping UX smooth
      }
      window.dispatchEvent(new CustomEvent(DRAFT_EVENT, { detail: storageKey }));
    },
    [storageKey, initialData]
  );

  const resetDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Ignore storage errors
    }
    rawCache.delete(storageKey);
    parsedCache.delete(storageKey);
    window.dispatchEvent(new CustomEvent(DRAFT_EVENT, { detail: storageKey }));
  }, [storageKey]);

  const importJsonText = useCallback(
    (jsonText: string): { ok: boolean; error?: string } => {
      try {
        const parsed = JSON.parse(jsonText) as T;
        const serialized = JSON.stringify(parsed, null, 2);
        window.localStorage.setItem(storageKey, serialized);
        rawCache.set(storageKey, serialized);
        parsedCache.set(storageKey, parsed);
        window.dispatchEvent(new CustomEvent(DRAFT_EVENT, { detail: storageKey }));
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "JSON 格式无效" };
      }
    },
    [storageKey]
  );

  const downloadJson = useCallback(
    (filename: string) => {
      const current = readCachedDraft(storageKey, initialData).data;
      const blob = new Blob([JSON.stringify(current, null, 2) + "\n"], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    },
    [storageKey, initialData]
  );

  const getSerializedJson = useCallback(() => {
    const current = readCachedDraft(storageKey, initialData).data;
    return JSON.stringify(current, null, 2) + "\n";
  }, [storageKey, initialData]);

  return {
    data,
    editMode,
    hasDraft,
    updateData,
    resetDraft,
    importJsonText,
    downloadJson,
    getSerializedJson,
  };
}
