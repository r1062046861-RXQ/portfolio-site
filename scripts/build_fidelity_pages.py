#!/usr/bin/env python3
"""Decompose all 81 core project pages of 2025作品集.pdf into 3 editable layers:
1. Clean decorative backdrop (bgColor + optional bgImage WebP without foreground images/placeholders/text)
2. Standalone & continuous-clustered foreground images/collages (exact % bbox & z-order)
3. Real DOM text blocks with exact % coordinates, typography, alignment, color, and vertical rotation.

Preserves existing homepage summary/hero/theme/meta fields in src/data/portfolio2025/projects/*.json
while adding `pages: FolioPage[]` so /portfolio/[slug]/ renders 1:1 original layout cleanly.
"""

from __future__ import annotations

import json
import math
import re
import shutil
from collections import Counter
from pathlib import Path

import fitz
from PIL import Image, ImageDraw, ImageStat

PDF_PATH = Path(r"C:\Users\C2H6O\Desktop\作品集排版文件\2025作品集\2025作品集.pdf")
SITE_ROOT = Path(r"C:\Users\C2H6O\Desktop\RXQ WEB\portfolio-site")
PROJ_JSON_DIR = SITE_ROOT / "src" / "data" / "portfolio2025" / "projects"
PAGES_IMG_DIR = SITE_ROOT / "public" / "portfolio-2025" / "pages"
MANIFEST_OUT = SITE_ROOT / "scripts" / "fidelity_manifest.json"
SPOTCHECK_OUT = Path(
    r"C:\Users\C2H6O\.gemini\antigravity\brain\a0e98ee2-3d34-4673-85d6-56220a34f864\scratch\portfolio_2025\fidelity_spotcheck.jpg"
)

PROJECT_PAGE_RANGES: list[tuple[str, list[int]]] = [
    ("01-millennium-phantom", list(range(5, 15))),
    ("02-sleepless", list(range(15, 20))),
    ("03-awakening", list(range(20, 24))),
    ("04-collapse", list(range(24, 28))),
    ("05-against-the-current", list(range(28, 30))),
    ("06-biological-alchemy", list(range(30, 36))),
    ("07-national-arts-fund", list(range(36, 41))),
    ("08-digital-art-anthology", list(range(41, 51))),
    ("09-design-your-future", list(range(53, 60))),
    ("10-yangliuqing-aigc", list(range(60, 70))),
    ("11-red-chamber-aesthetics", list(range(70, 72))),
    ("12-china-science-museum", list(range(74, 77))),
    ("13-tianjin-sci-art-contest", [77]),
    ("14-tafa-2024-graduation", list(range(78, 82))),
    ("15-china-daily-ma-yuan", [82, 83]),
    ("16-jiading-wonder-trip", [84, 85]),
    ("17-kuaishou-2025", [86, 87]),
]

TYPO_FIXES = [
    ("马原的意境诗篇", "马远的意境诗篇"),
    ("AlGC+", "AIGC+"),
    ("DREAM OF THE RED CHAMBE\n", "DREAM OF THE RED CHAMBER\n"),
]


def fix_typos(text: str) -> str:
    text = text.replace("\u200b", "").replace("\ufeff", "")
    for old, new in TYPO_FIXES:
        if old in text:
            text = text.replace(old, new)
    if text.strip() == "DREAM OF THE RED CHAMBE":
        text = text.replace("DREAM OF THE RED CHAMBE", "DREAM OF THE RED CHAMBER")
    return text


def pixmap_has_usable_alpha(doc: fitz.Document, xref: int, smask: int) -> tuple[bool, Image.Image | None]:
    """Check if raw PDF image xref has SMask transparency and return composited RGBA PIL Image."""
    if smask <= 0:
        return False, None
    try:
        base = fitz.Pixmap(doc, xref)
        if base.colorspace is None or base.colorspace.n > 3 or base.colorspace.name != "DeviceRGB":
            base = fitz.Pixmap(fitz.csRGB, base)
        mask = fitz.Pixmap(doc, smask)
        if mask.width != base.width or mask.height != base.height:
            return False, None
        comp = fitz.Pixmap(base, mask)
        im = Image.frombytes("RGBA", (comp.width, comp.height), comp.samples)
        alpha_min, _ = im.getchannel("A").getextrema()
        if alpha_min < 245:
            return True, im
    except Exception:
        return False, None
    return False, None


def save_pil_webp(im: Image.Image, dest: Path, max_side: int, quality: int, preserve_alpha: bool = False) -> tuple[int, int, int]:
    dest.parent.mkdir(parents=True, exist_ok=True)
    w, h = im.size
    mx = max(w, h)
    if mx > max_side:
        scale = max_side / mx
        im = im.resize((max(1, int(round(w * scale))), max(1, int(round(h * scale)))), Image.Resampling.LANCZOS)
    if preserve_alpha and im.mode == "RGBA":
        im.save(dest, format="WEBP", quality=max(quality, 85), method=5)
    else:
        im.convert("RGB").save(dest, format="WEBP", quality=quality, method=5)
    return im.size[0], im.size[1], dest.stat().st_size


def clamp_bbox(bb: tuple[float, float, float, float], pw: float, ph: float) -> tuple[float, float, float, float]:
    x0 = max(0.0, min(pw, bb[0]))
    y0 = max(0.0, min(ph, bb[1]))
    x1 = max(x0, min(pw, bb[2]))
    y1 = max(y0, min(ph, bb[3]))
    return (x0, y0, x1, y1)


def is_backdrop_image(info: dict, pw: float, ph: float, pno: int) -> bool:
    xref = info["xref"]
    if xref <= 0:
        return True
    x0, y0, x1, y1 = info["bbox"]
    bw, bh = x1 - x0, y1 - y0
    if bw < 4 or bh < 4:
        return True
    # Edge border bars (e.g. P21 top/left/right/bottom metallic strips)
    if ((y0 <= 14 or y1 >= ph - 14) and bh <= 34 and bw >= pw * 0.25):
        return True
    if ((x0 <= 14 or x1 >= pw - 14) and bw <= 34 and bh >= ph * 0.25):
        return True
    # Full-page background / backdrop artwork
    if bw / pw >= 0.84 and bh / ph >= 0.84:
        return True
    # P22 4 silver gradient quadrant panels beneath the 18-frame spiral
    if pno == 22 and xref in (364, 365, 386, 387):
        return True
    return False


def rects_should_merge(a: dict, b: dict, pno: int) -> bool:
    """Merge only truly overlapping composites or tight aligned strip slices."""
    ax0, ay0, ax1, ay1 = a["bbox"]
    bx0, by0, bx1, by1 = b["bbox"]
    aw, ah = max(1e-3, ax1 - ax0), max(1e-3, ay1 - ay0)
    bw, bh = max(1e-3, bx1 - bx0), max(1e-3, by1 - by0)

    ix0, iy0 = max(ax0, bx0), max(ay0, by0)
    ix1, iy1 = min(ax1, bx1), min(ay1, by1)
    iw, ih = max(0.0, ix1 - ix0), max(0.0, iy1 - iy0)
    inter = iw * ih
    min_area = min(aw * ah, bw * bh)

    # P22 spiral steps touch slightly at corners intentionally -> keep 18 individual frames clickable
    if pno == 22:
        return False

    # 1. Genuine significant overlap (> 5% of smaller bbox)
    if inter > 0.05 * min_area:
        return True

    # 2. Horizontally adjacent aligned strips (gap <= 5.5pt & vertical overlap >= 65% of taller strip)
    h_gap = max(bx0 - ax1, ax0 - bx1)
    v_ov_ratio = ih / max(ah, bh)
    if h_gap <= 5.5 and v_ov_ratio >= 0.65:
        return True

    # 3. Vertically adjacent aligned strips (gap <= 5.5pt & horizontal overlap >= 65% of wider strip)
    v_gap = max(by0 - ay1, ay0 - by1)
    h_ov_ratio = iw / max(aw, bw)
    if v_gap <= 5.5 and h_ov_ratio >= 0.65:
        return True

    return False


def cluster_foreground_images(fg_infos: list[dict], pno: int) -> list[list[dict]]:
    n = len(fg_infos)
    parent = list(range(n))

    def find(i: int) -> int:
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    def union(i: int, j: int) -> None:
        ri, rj = find(i), find(j)
        if ri != rj:
            parent[ri] = rj

    for i in range(n):
        for j in range(i + 1, n):
            if rects_should_merge(fg_infos[i], fg_infos[j], pno):
                union(i, j)

    raw_groups: dict[int, list[dict]] = {}
    for i in range(n):
        raw_groups.setdefault(find(i), []).append(fg_infos[i])

    # Guard against hollow sparse L-shaped merges: require fill ratio >= 0.48
    final_groups: list[list[dict]] = []
    for g in raw_groups.values():
        if len(g) == 1:
            final_groups.append(g)
            continue
        ux0 = min(x["bbox"][0] for x in g)
        uy0 = min(x["bbox"][1] for x in g)
        ux1 = max(x["bbox"][2] for x in g)
        uy1 = max(x["bbox"][3] for x in g)
        u_area = max(1e-3, (ux1 - ux0) * (uy1 - uy0))
        sum_area = sum(max(0.0, (x["bbox"][2] - x["bbox"][0]) * (x["bbox"][3] - x["bbox"][1])) for x in g)
        if sum_area / u_area >= 0.48 or len(g) >= 3:
            # For 3+ items, check if each item is small/strip relative to union or solid collage
            # Actually P21 has 15 items where overlay face+sculpture fill > 0.65; P08 has 2 items in L-shape (<0.48) -> split!
            if sum_area / u_area >= 0.45:
                final_groups.append(g)
            else:
                for item in g:
                    final_groups.append([item])
        else:
            for item in g:
                final_groups.append([item])

    # Sort reading order top-to-bottom, left-to-right
    final_groups.sort(key=lambda grp: (round(min(x["bbox"][1] for x in grp) / 16.0), min(x["bbox"][0] for x in grp)))
    return final_groups


def dominant_edge_hex(im: Image.Image) -> str:
    """Sample perimeter pixels to get representative solid background hex."""
    rgb = im.convert("RGB")
    w, h = rgb.size
    samples: list[tuple[int, int, int]] = []
    for x in range(0, w, max(1, w // 24)):
        samples.append(rgb.getpixel((x, 2)))
        samples.append(rgb.getpixel((x, max(0, h - 3))))
    for y in range(0, h, max(1, h // 24)):
        samples.append(rgb.getpixel((2, y)))
        samples.append(rgb.getpixel((max(0, w - 3), y)))
    med_r = sorted(s[0] for s in samples)[len(samples) // 2]
    med_g = sorted(s[1] for s in samples)[len(samples) // 2]
    med_b = sorted(s[2] for s in samples)[len(samples) // 2]
    return f"#{med_r:02x}{med_g:02x}{med_b:02x}"


def _span_family(font_name: str) -> str:
    return "serif" if ("Huiwen" in font_name or "KingHwa" in font_name) else "sans"


def _styles_match(a: dict, b: dict) -> bool:
    return (
        abs(a["size"] - b["size"]) < 1.2
        and a["color"] == b["color"]
        and _span_family(a["font"]) == _span_family(b["font"])
    )


def _char_weight(ch: str) -> float:
    if ch == "\u3000":
        return 1.0
    if ch.isascii():
        return 0.42 if ch == " " else 0.54
    return 1.0


def _expand_wide_space_span(sp: dict) -> list[dict]:
    """Split single spans containing 3+ consecutive spaces into separate horizontal sub-spans."""
    raw = sp.get("text", "")
    if not raw or not re.search(r"[ \t\u3000]{3,}", raw.strip()):
        return [sp]
    cum = [0.0]
    for ch in raw:
        cum.append(cum[-1] + _char_weight(ch))
    tot = cum[-1]
    if tot <= 0:
        return [sp]
    x0, y0, x1, y1 = sp["bbox"]
    w = max(0.1, x1 - x0)
    out: list[dict] = []
    for m in re.finditer(r"[^ \t\u3000]+(?:[ \t\u3000]{1,2}[^ \t\u3000]+)*", raw):
        s_txt = m.group(0).strip()
        if not s_txt:
            continue
        sx0 = x0 + w * (cum[m.start()] / tot)
        sx1 = x0 + w * (cum[m.end()] / tot)
        cloned = dict(sp)
        cloned["text"] = s_txt
        cloned["bbox"] = (sx0, y0, sx1, y1)
        out.append(cloned)
    return out or [sp]


_LIST_PREFIX_RE = re.compile(
    r"^(?:[・·•●○▪▫◆◇■□①②③④⑤⑥⑦⑧⑨⑩]|-\s|–\s|—\s|\*\s|\d{1,2}[.、)）]|[（(]\d{1,2}[)）]|0\d(?=\s*\S)|[A-Za-z\u4e00-\u9fff]{1,6}[：:])"
)


def _is_list_start(text: str) -> bool:
    return bool(_LIST_PREFIX_RE.match(text.lstrip()))


def _join_wrapped(prev_txt: str, cur_txt: str) -> str:
    last_ch = prev_txt[-1] if prev_txt else ""
    first_ch = cur_txt[0] if cur_txt else ""
    sep = " " if (last_ch.isascii() and last_ch.isalnum() and first_ch.isascii() and first_ch.isalnum()) else ""
    return prev_txt + sep + cur_txt


def extract_text_layers(page: fitz.Page, pw: float, ph: float, pno: int) -> list[dict]:
    """Extract clean DOM-editable text boxes with exact typography, indentation, single-line anchors, and continuation merges."""
    tdict = page.get_text("dict")
    raw_items: list[dict] = []

    for b in tdict["blocks"]:
        if b["type"] != 0:
            continue
        raw_lines = b.get("lines", [])
        if not raw_lines:
            continue

        # Check orientation from first non-empty line
        first_dir = raw_lines[0]["dir"]
        cos_d, sin_d = round(first_dir[0], 1), round(first_dir[1], 1)

        if (cos_d, sin_d) != (1.0, 0.0):
            # Vertical / rotated text block (only 4 across whole PDF: P06, P28, P44, P53)
            spans = [sp for ln in raw_lines for sp in ln["spans"] if sp["text"]]
            if not spans:
                continue
            txt = "\n".join("".join(sp["text"] for sp in ln["spans"]).rstrip() for ln in raw_lines).strip()
            txt = fix_typos(txt)
            if not txt:
                continue
            bb = clamp_bbox(b["bbox"], pw, ph)
            bx0, by0, bx1, by1 = bb
            dom_sp = max(spans, key=lambda s: len(s["text"].strip()))
            rotation = 90 if sin_d > 0 else -90
            raw_items.append({
                "text": txt,
                "x": round(bx0 / pw * 100, 3),
                "y": round(by0 / ph * 100, 3),
                "w": round(max(1.5, (bx1 - bx0) / pw * 100), 3),
                "h": round(max(1.5, (by1 - by0) / ph * 100), 3),
                "fontSizePt": round(dom_sp["size"], 2),
                "lineHeight": 1.25,
                "color": f"#{dom_sp['color']:06x}",
                "fontFamily": "sans",
                "fontWeight": 500,
                "align": "left",
                "rotation": rotation,
            })
            continue

        # Horizontal block: expand multi-space spans, then split along line on wide gaps or style changes
        all_segments: list[dict] = []
        for ln in raw_lines:
            expanded: list[dict] = []
            for sp in ln["spans"]:
                if not sp["text"] or not sp["text"].strip():
                    continue
                expanded.extend(_expand_wide_space_span(sp))
            if not expanded:
                continue
            curr: list[dict] = [expanded[0]]
            for sp in expanded[1:]:
                prev = curr[-1]
                gap = sp["bbox"][0] - prev["bbox"][2]
                sz = max(prev["size"], sp["size"])
                if gap > max(18.0, 1.75 * sz) or not _styles_match(prev, sp):
                    all_segments.append({"spans": curr})
                    curr = [sp]
                else:
                    curr.append(sp)
            if curr:
                all_segments.append({"spans": curr})

        seg_boxes = []
        for seg in all_segments:
            sps = seg["spans"]
            sx0 = min(s["bbox"][0] for s in sps)
            sy0 = min(s["bbox"][1] for s in sps)
            sx1 = max(s["bbox"][2] for s in sps)
            sy1 = max(s["bbox"][3] for s in sps)
            txt = fix_typos("".join(s["text"] for s in sps).strip())
            if not txt:
                continue
            dom_sp = max(sps, key=lambda s: len(s["text"].strip()))
            seg_boxes.append({
                "x0": sx0, "y0": sy0, "x1": sx1, "y1": sy1,
                "text": txt, "size": dom_sp["size"],
                "color": dom_sp["color"], "font": dom_sp["font"], "flags": dom_sp["flags"],
            })

        if not seg_boxes:
            continue

        # Group segments into style-homogeneous columns, guarding against merging side-by-side same-row items
        columns: list[list[dict]] = []
        for sb in seg_boxes:
            placed = False
            for col in columns:
                ref = col[0]
                if not _styles_match(ref, sb):
                    continue
                cx0 = min(c["x0"] for c in col)
                cx1 = max(c["x1"] for c in col)
                cy1 = max(c["y1"] for c in col)
                ov = min(cx1, sb["x1"]) - max(cx0, sb["x0"])
                same_x = abs(sb["x0"] - cx0) <= max(28.0, 2.5 * sb["size"])
                # Never merge horizontally disjoint segments occupying the same horizontal Y band
                same_band_disjoint = any(
                    (min(c["y1"], sb["y1"]) - max(c["y0"], sb["y0"]) > 0.35 * min(c["y1"] - c["y0"], sb["y1"] - sb["y0"]))
                    and (max(c["x0"], sb["x0"]) > min(c["x1"], sb["x1"]) + 1.5)
                    for c in col
                )
                if not same_band_disjoint and (ov > 0 or same_x) and (sb["y0"] - cy1) <= max(48.0, 3.2 * sb["size"]):
                    col.append(sb)
                    placed = True
                    break
            if not placed:
                columns.append([sb])

        for col in columns:
            col.sort(key=lambda c: (round(c["y0"], 1), c["x0"]))
            raw_items.append({"_col": col})

    # Post-block continuation merge pass: rejoin body paragraphs split by PyMuPDF across blocks (e.g. P19 B04+B05)
    merged_items: list[dict] = []
    for item in raw_items:
        if "_col" not in item:
            merged_items.append(item)
            continue
        col_b = item["_col"]
        sz_b = col_b[0]["size"]
        min_x_b = min(c["x0"] for c in col_b)
        b_indented = (col_b[0]["x0"] - min_x_b) >= 0.65 * sz_b
        did_merge = False
        if not b_indented and not _is_list_start(col_b[0]["text"]):
            for prev_item in reversed(merged_items):
                if "_col" not in prev_item:
                    continue
                col_a = prev_item["_col"]
                if not _styles_match(col_a[0], col_b[0]):
                    continue
                # Must share aligned body left margin (all lines after optional indent of A vs body of B)
                body_x_a = min(c["x0"] for c in (col_a[1:] if len(col_a) >= 2 else col_a))
                body_x_b = min_x_b
                if abs(body_x_a - body_x_b) > 4.0:
                    continue
                col_ax1 = max(c["x1"] for c in col_a)
                col_aw = max(1.0, col_ax1 - body_x_a)
                last_a = col_a[-1]
                last_a_w = last_a["x1"] - body_x_a
                dy = col_b[0]["y0"] - last_a["y0"]
                # Only merge if A looks like a multi-line body column ending near right margin & B continues right below
                if len(col_a) >= 2 and col_aw > sz_b * 8 and (last_a_w / col_aw) >= 0.78 and 0.75 * sz_b <= dy <= 1.75 * sz_b:
                    col_a.extend(col_b)
                    did_merge = True
                    break
        if not did_merge:
            merged_items.append(item)

    text_items: list[dict] = []
    seq = 0
    for item in merged_items:
        seq += 1
        if "_col" not in item:
            item["id"] = f"p{pno:02d}-t{seq:02d}"
            item["z"] = seq
            text_items.append(item)
            continue

        col = item["_col"]
        col.sort(key=lambda c: (round(c["y0"], 1), c["x0"]))
        col_x0 = min(c["x0"] for c in col)
        col_y0 = min(c["y0"] for c in col)
        col_x1 = max(c["x1"] for c in col)
        col_y1 = max(c["y1"] for c in col)
        col_w = max(8.0, col_x1 - col_x0)

        # Dominant style
        longest = max(col, key=lambda c: len(c["text"]))
        font_sz = longest["size"]
        font_name = longest["font"]
        font_family = _span_family(font_name)
        is_bold = bool(longest["flags"] & 16) or "Bold" in font_name or "Medium" in font_name or font_sz >= 22.0
        font_weight = 600 if is_bold else 400

        # Estimate alignment before line wrap collapse
        align = "left"
        if len(col) >= 2 and col_w > font_sz * 3:
            centers = [((c["x0"] + c["x1"]) / 2) for c in col]
            lefts = [c["x0"] for c in col]
            if (max(centers) - min(centers)) < 6.0 and (max(lefts) - min(lefts)) > 8.0:
                align = "center"

        # Detect true first-line Chinese indent (line 0 starts inside [0.65em, 2.6em] while lines 1+ align left)
        text_indent_em: float | None = None
        if align == "left" and len(col) >= 2:
            rest_xs = [c["x0"] for c in col[1:]]
            body_x0 = min(rest_xs)
            indent_dx = col[0]["x0"] - body_x0
            if (
                max(rest_xs) - body_x0 <= 4.0
                and 0.65 * font_sz <= indent_dx <= 2.6 * font_sz
                and not _is_list_start(col[0]["text"])
            ):
                # Reject 2-line centered caption accidentally passing max(centers) tolerance
                c0 = (col[0]["x0"] + col[0]["x1"]) / 2
                c1 = (col[1]["x0"] + col[1]["x1"]) / 2
                if not (len(col) == 2 and abs(c0 - c1) < 5.0):
                    text_indent_em = round(indent_dx / font_sz, 2)

        # Smart merge of wrapped lines inside paragraphs, preserving explicit list bullets, indents, and symmetric tag pairs
        merged_parts: list[str] = [col[0]["text"]]
        for idx in range(1, len(col)):
            prev = col[idx - 1]
            cur = col[idx]
            prev_w = prev["x1"] - col_x0
            dy = cur["y0"] - prev["y0"]
            same_style = _styles_match({"size": prev["size"], "color": prev["color"], "font": prev["font"]},
                                       {"size": cur["size"], "color": cur["color"], "font": cur["font"]})
            cur_indented = (cur["x0"] - col_x0) >= 0.65 * cur["size"]
            prev_s, cur_s = prev["text"].strip(), cur["text"].strip()
            symmetric_tag_pair = (
                len(prev_s) <= 8
                and len(cur_s) <= 8
                and abs(len(prev_s) - len(cur_s)) <= 1
                and not re.search(r"[，。！？、；：,.!?;:]", prev_s + cur_s)
            )
            if (
                same_style
                and col_w > cur["size"] * 5
                and prev_w / col_w >= 0.76
                and dy <= cur["size"] * 1.95
                and not _is_list_start(cur["text"])
                and not cur_indented
                and not symmetric_tag_pair
            ):
                merged_parts[-1] = _join_wrapped(merged_parts[-1], cur["text"])
            else:
                merged_parts.append(cur["text"])

        full_txt = fix_typos("\n".join(merged_parts).strip())
        if not full_txt:
            seq -= 1
            continue

        is_single_line = len(col) == 1 and "\n" not in full_txt
        if is_single_line:
            line_height = 1.2
        else:
            dys = [
                col[i]["y0"] - col[i - 1]["y0"]
                for i in range(1, len(col))
                if 0.8 * font_sz <= (col[i]["y0"] - col[i - 1]["y0"]) <= 2.4 * font_sz
            ]
            line_height = round(max(1.2, min(1.95, (sum(dys) / len(dys)) / font_sz)), 2) if dys else 1.38

        bx0, by0, bx1, by1 = clamp_bbox((col_x0, col_y0, col_x1, col_y1), pw, ph)
        # Compensate CSS half-leading above PingFangSC 1.20em ascent+descent line box
        half_leading_pt = max(0.0, (line_height - 1.20) * 0.5 * font_sz)
        x_pct = round(bx0 / pw * 100, 3)
        y_pct = round(max(0.0, (by0 - half_leading_pt) / ph * 100), 3)
        raw_w_pct = max(1.0, (bx1 - bx0) / pw * 100)
        w_pct = round(min(100.0 - x_pct, raw_w_pct + 0.55), 3)
        h_pct = round(max(1.2, (by1 - by0) / ph * 100), 3)

        entry: dict = {
            "id": f"p{pno:02d}-t{seq:02d}",
            "text": full_txt,
            "x": x_pct,
            "y": y_pct,
            "w": w_pct,
            "h": h_pct,
            "z": seq,
            "fontSizePt": round(font_sz, 2),
            "lineHeight": line_height,
            "color": f"#{longest['color']:06x}",
            "fontFamily": font_family,
            "fontWeight": font_weight,
            "align": align,
            "rotation": 0,
        }
        if is_single_line:
            entry["singleLine"] = True
            if (bx1 / pw * 100) >= 91.5:
                entry["anchorRight"] = True
                entry["rightPct"] = round(max(0.0, (pw - bx1) / pw * 100), 3)
        if text_indent_em:
            entry["textIndentEm"] = text_indent_em

        text_items.append(entry)

    # Clamp each horizontal box's right edge before any neighboring right-side column on the same band
    for i, a in enumerate(text_items):
        if a.get("rotation", 0) != 0:
            continue
        ax0, ay0, ay1 = a["x"], a["y"], a["y"] + a["h"]
        nearest_right = 100.0
        for j, b in enumerate(text_items):
            if i == j or b.get("rotation", 0) != 0:
                continue
            bx0, by0, by1 = b["x"], b["y"], b["y"] + b["h"]
            if min(ay1, by1) - max(ay0, by0) > 0.4 and bx0 > ax0 + 2.0:
                if bx0 < nearest_right:
                    nearest_right = bx0
        if nearest_right < 100.0:
            max_w = max(2.0, nearest_right - ax0 - 1.15)
            if a["w"] > max_w:
                a["w"] = round(max_w, 3)

    return text_items


def process_page(doc: fitz.Document, pno: int, slug: str, page_dir: Path) -> dict:
    """Decompose single PDF page into pure bg + single/merged fg images + text items."""
    orig_page = doc[pno - 1]
    pw, ph = orig_page.rect.width, orig_page.rect.height
    smask_map = {im[0]: im[1] for im in orig_page.get_images(full=True)}

    # Pass 1: textless clone (keeps 100% graphics + images, 0 text)
    mem_tl = fitz.open()
    mem_tl.insert_pdf(doc, from_page=pno - 1, to_page=pno - 1)
    tl_page = mem_tl[0]
    tl_page.add_redact_annot(tl_page.rect, fill=False)
    tl_page.apply_redactions(
        images=fitz.PDF_REDACT_IMAGE_NONE,
        graphics=fitz.PDF_REDACT_LINE_ART_NONE,
        text=fitz.PDF_REDACT_TEXT_REMOVE,
    )

    # Identify foreground images & cluster continuous collages/overlaps
    raw_infos = orig_page.get_image_info(xrefs=True)
    fg_infos = [inf for inf in raw_infos if not is_backdrop_image(inf, pw, ph, pno)]
    clusters = cluster_foreground_images(fg_infos, pno)

    fg_layers: list[dict] = []
    for idx, grp in enumerate(clusters, 1):
        ux0 = min(g["bbox"][0] for g in grp)
        uy0 = min(g["bbox"][1] for g in grp)
        ux1 = max(g["bbox"][2] for g in grp)
        uy1 = max(g["bbox"][3] for g in grp)
        cx0, cy0, cx1, cy1 = clamp_bbox((ux0, uy0, ux1, uy1), pw, ph)
        if cx1 - cx0 < 2.0 or cy1 - cy0 < 2.0:
            continue

        fname = f"p{pno:02d}-g{idx:02d}.webp"
        dest = page_dir / fname
        clip_rect = fitz.Rect(cx0, cy0, cx1, cy1)

        if len(grp) == 1:
            xref = grp[0]["xref"]
            smask = smask_map.get(xref, 0)
            has_alpha, alpha_im = pixmap_has_usable_alpha(doc, xref, smask)
            if has_alpha and alpha_im is not None:
                save_pil_webp(alpha_im, dest, max_side=(2200 if pno == 7 else 1600), quality=85, preserve_alpha=True)
            else:
                scale = 2.8 if pno == 7 else 2.2
                pix = tl_page.get_pixmap(clip=clip_rect, matrix=fitz.Matrix(scale, scale))
                im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
                save_pil_webp(im, dest, max_side=(2200 if pno == 7 else 1600), quality=84)
            kind = "single"
            alt = f"P{pno:02d} 作品图像 #{idx:02d}"
        else:
            scale = 2.4
            pix = tl_page.get_pixmap(clip=clip_rect, matrix=fitz.Matrix(scale, scale))
            im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            save_pil_webp(im, dest, max_side=1800, quality=85)
            kind = "continuous-group"
            alt = f"P{pno:02d} 连续拼贴组合图（含 {len(grp)} 组连续图层）"

        fg_layers.append({
            "id": f"p{pno:02d}-i{idx:02d}",
            "src": f"/portfolio-2025/pages/{slug}/{fname}",
            "x": round(cx0 / pw * 100, 3),
            "y": round(cy0 / ph * 100, 3),
            "w": round((cx1 - cx0) / pw * 100, 3),
            "h": round((cy1 - cy0) / ph * 100, 3),
            "z": idx,
            "kind": kind,
            "tileCount": len(grp),
            "alt": alt,
            "caption": alt if kind == "continuous-group" else "",
        })

    # Pass 2: remove ONLY exact foreground image xrefs (preserving overlapping backdrop xrefs!)
    # and clean gray placeholder rects covered strictly by foreground boxes
    mem_bg = fitz.open()
    mem_bg.insert_pdf(mem_tl, from_page=0, to_page=0)
    bg_page = mem_bg[0]
    if fg_infos:
        bg_xrefs = {inf["xref"] for inf in raw_infos if inf["xref"] > 0 and is_backdrop_image(inf, pw, ph, pno)}
        for inf in fg_infos:
            xref = inf["xref"]
            if xref > 0 and xref not in bg_xrefs:
                try:
                    bg_page.delete_image(xref)
                except Exception:
                    pass
        for inf in fg_infos:
            x0, y0, x1, y1 = inf["bbox"]
            bg_page.add_redact_annot(fitz.Rect(x0 - 0.8, y0 - 0.8, x1 + 0.8, y1 + 0.8), fill=False)
        bg_page.apply_redactions(
            images=fitz.PDF_REDACT_IMAGE_NONE,
            graphics=fitz.PDF_REDACT_LINE_ART_REMOVE_IF_COVERED,
            text=fitz.PDF_REDACT_TEXT_NONE,
        )

    bg_pix = bg_page.get_pixmap(matrix=fitz.Matrix(1.6, 1.6))
    bg_im = Image.frombytes("RGB", (bg_pix.width, bg_pix.height), bg_pix.samples)
    bg_color = dominant_edge_hex(bg_im)
    max_std = max(ImageStat.Stat(bg_im).stddev)

    bg_src: str | None = None
    if max_std >= 1.5:
        bg_name = f"p{pno:02d}-bg.webp"
        bg_dest = page_dir / bg_name
        save_pil_webp(bg_im, bg_dest, max_side=1500, quality=82)
        bg_src = f"/portfolio-2025/pages/{slug}/{bg_name}"

    mem_tl.close()
    mem_bg.close()

    # Extract text layer from original page
    texts = extract_text_layers(orig_page, pw, ph, pno)

    page_obj = {
        "id": f"p{pno:02d}",
        "pageNo": pno,
        "label": f"原稿 P{pno:02d}",
        "widthPt": round(pw, 1),
        "heightPt": round(ph, 1),
        "bgColor": bg_color,
        "images": fg_layers,
        "texts": texts,
    }
    if bg_src:
        page_obj["bgImage"] = bg_src
    return page_obj


def main() -> None:
    if PAGES_IMG_DIR.exists():
        shutil.rmtree(PAGES_IMG_DIR)
    PAGES_IMG_DIR.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(PDF_PATH)
    summary = {"total_pages": 0, "total_fg_layers": 0, "total_text_layers": 0, "solid_bg_pages": 0, "projects": {}}

    for slug, page_list in PROJECT_PAGE_RANGES:
        pdir = PAGES_IMG_DIR / slug
        pdir.mkdir(parents=True, exist_ok=True)
        folio_pages = []
        for pno in page_list:
            pg = process_page(doc, pno, slug, pdir)
            folio_pages.append(pg)
            summary["total_pages"] += 1
            summary["total_fg_layers"] += len(pg["images"])
            summary["total_text_layers"] += len(pg["texts"])
            if "bgImage" not in pg:
                summary["solid_bg_pages"] += 1

        # Patch corresponding project JSON preserving curated metadata + adding pages
        json_path = PROJ_JSON_DIR / f"{slug}.json"
        proj_data = json.loads(json_path.read_text(encoding="utf-8"))
        proj_data["pages"] = folio_pages
        json_path.write_text(json.dumps(proj_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        summary["projects"][slug] = {
            "pages": len(folio_pages),
            "fg_layers": sum(len(p["images"]) for p in folio_pages),
            "text_layers": sum(len(p["texts"]) for p in folio_pages),
        }
        print(
            f"{slug:28s} | pages={len(folio_pages):2d} | fg={summary['projects'][slug]['fg_layers']:3d} | txt={summary['projects'][slug]['text_layers']:3d}"
        )

    total_files = sum(1 for _ in PAGES_IMG_DIR.rglob("*.webp"))
    total_bytes = sum(f.stat().st_size for f in PAGES_IMG_DIR.rglob("*.webp"))
    summary["total_webp_files"] = total_files
    summary["total_webp_mb"] = round(total_bytes / 1024 / 1024, 2)
    MANIFEST_OUT.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    print(
        f"\nDONE! {summary['total_pages']} pages, {summary['total_fg_layers']} fg layers ({summary['solid_bg_pages']} pure-color bgs), {summary['total_text_layers']} text boxes."
    )
    print(f"Pages assets: {total_files} files, {summary['total_webp_mb']} MB")

    # Render composite 6-page spotcheck collage reconstructing bg + fg layers
    spot_pages = [
        ("01-millennium-phantom", 8),
        ("01-millennium-phantom", 12),
        ("03-awakening", 21),
        ("03-awakening", 22),
        ("10-yangliuqing-aigc", 63),
        ("11-red-chamber-aesthetics", 71),
    ]
    cw, ch, pad = 540, 382, 12
    sheet = Image.new("RGB", (2 * (cw + pad) + pad, 3 * (ch + 22 + pad) + pad), (30, 30, 30))
    draw = ImageDraw.Draw(sheet)
    pub_root = SITE_ROOT / "public"
    for idx, (slug, pno) in enumerate(spot_pages):
        proj_data = json.loads((PROJ_JSON_DIR / f"{slug}.json").read_text(encoding="utf-8"))
        pg = next(p for p in proj_data["pages"] if p["pageNo"] == pno)
        canvas = Image.new("RGBA", (cw, ch), pg["bgColor"])
        if pg.get("bgImage"):
            with Image.open(pub_root / pg["bgImage"].lstrip("/")) as bim:
                canvas.alpha_composite(bim.convert("RGBA").resize((cw, ch), Image.Resampling.LANCZOS))
        for im_layer in pg["images"]:
            ix = int(round(im_layer["x"] / 100 * cw))
            iy = int(round(im_layer["y"] / 100 * ch))
            iw = max(1, int(round(im_layer["w"] / 100 * cw)))
            ih = max(1, int(round(im_layer["h"] / 100 * ch)))
            with Image.open(pub_root / im_layer["src"].lstrip("/")) as fim:
                canvas.alpha_composite(fim.convert("RGBA").resize((iw, ih), Image.Resampling.LANCZOS), (ix, iy))
        r, c = divmod(idx, 2)
        x0, y0 = pad + c * (cw + pad), pad + r * (ch + 22 + pad)
        sheet.paste(canvas.convert("RGB"), (x0, y0))
        draw.rectangle([x0, y0 + ch, x0 + cw, y0 + ch + 20], fill=(15, 15, 15))
        draw.text((x0 + 6, y0 + ch + 4), f"P{pno:02d} RECONSTRUCTED ({len(pg['images'])} fg + {len(pg['texts'])} txt)", fill=(244, 242, 236))

    SPOTCHECK_OUT.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(SPOTCHECK_OUT, quality=88)
    print(f"Spotcheck saved: {SPOTCHECK_OUT}")


if __name__ == "__main__":
    main()
