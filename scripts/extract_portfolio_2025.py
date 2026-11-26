#!/usr/bin/env python3
"""Extract standalone artwork images from 2025作品集.pdf cleanly into WebP assets.

Handles CMYK->RGB conversion, SMask alpha compositing, flat paper background filtering,
size tiering, 2026 portrait 3:4 cropping, and emits extracted_manifest.json.
"""

from __future__ import annotations

import json
import os
import shutil
from pathlib import Path

import fitz
from PIL import Image, ImageDraw, ImageStat

PDF_PATH = Path(r"C:\Users\C2H6O\Desktop\作品集排版文件\2025作品集\2025作品集.pdf")
PORTRAIT_SRC = Path(r"C:\Users\C2H6O\Desktop\个人信息、作品\艺术照\任玄奇_标准折中版_01_伦勃朗光_柔和学者_4K超清.jpg")
SITE_ROOT = Path(r"C:\Users\C2H6O\Desktop\RXQ WEB\portfolio-site")
PUBLIC_OUT = SITE_ROOT / "public" / "portfolio-2025"
MANIFEST_OUT = SITE_ROOT / "scripts" / "extracted_manifest.json"
CONTACT_SHEET_OUT = Path(
    r"C:\Users\C2H6O\.gemini\antigravity\brain\a0e98ee2-3d34-4673-85d6-56220a34f864\scratch\portfolio_2025\asset_spotcheck.jpg"
)

PROJECTS = [
    ("01-millennium-phantom", "Ⅰ-01", "艺术创作", "千禧幻像合成器", range(5, 15)),
    ("02-sleepless", "Ⅰ-02", "艺术创作", "不眠 & 不眠·续篇", range(15, 20)),
    ("03-awakening", "Ⅰ-03", "艺术创作", "苏醒", range(20, 24)),
    ("04-collapse", "Ⅰ-04", "艺术创作", "坍缩", range(24, 28)),
    ("05-against-the-current", "Ⅰ-05", "艺术创作", "逆流", range(28, 30)),
    ("06-biological-alchemy", "Ⅰ-06", "艺术创作", "生物炼金术", range(30, 36)),
    ("07-national-arts-fund", "Ⅰ-07", "艺术创作", "国家艺术基金驻地创作合集", range(36, 41)),
    ("08-digital-art-anthology", "Ⅰ-08", "艺术创作", "数字艺术创作小辑", range(41, 51)),
    ("09-design-your-future", "Ⅱ-01", "科研课题项目", "设计你的未来", range(53, 60)),
    ("10-yangliuqing-aigc", "Ⅱ-02", "科研课题项目", "杨柳青木版年画非遗数字化焕新", range(60, 70)),
    ("11-red-chamber-aesthetics", "Ⅱ-03", "科研课题项目", "《红楼梦》中华美学当代艺术转化", range(70, 72)),
    ("12-china-science-museum", "Ⅲ-01", "商业项目", "中国科学技术馆 · 音乐会音乐可视化", range(74, 77)),
    ("13-tianjin-sci-art-contest", "Ⅲ-02", "商业项目", "天津市科技美术设计大赛 · 宣传片", range(77, 78)),
    ("14-tafa-2024-graduation", "Ⅲ-03", "商业项目", "天津美术学院 2024 毕业季《生如夏花》", range(78, 82)),
    ("15-china-daily-ma-yuan", "Ⅲ-04", "商业项目", "中国日报社 ·《马远的意境诗篇》", range(82, 84)),
    ("16-jiading-wonder-trip", "Ⅲ-05", "商业项目", "上海嘉定文旅 ·《嘉定奇旅》", range(84, 86)),
    ("17-kuaishou-2025", "Ⅲ-06", "商业项目", "快手磁力引擎 2025 宣传片", range(86, 88)),
]

# Known full-page solid/tinted paper background images that are not standalone artworks
KNOWN_FLAT_BG_XREFS = {59, 251, 1185}


def pixmap_to_pil(doc: fitz.Document, xref: int, smask: int) -> tuple[Image.Image, bool]:
    """Safely convert any PDF image xref (incl. CMYK / Indexed / SMask) to RGB or RGBA PIL Image."""
    base = fitz.Pixmap(doc, xref)
    if base.colorspace is None or base.colorspace.n > 3 or base.colorspace.name not in ("DeviceRGB",):
        if base.alpha:
            base = fitz.Pixmap(fitz.csRGB, base)
        else:
            base = fitz.Pixmap(fitz.csRGB, base)

    has_alpha = False
    if smask > 0:
        mask = fitz.Pixmap(doc, smask)
        if mask.width == base.width and mask.height == base.height:
            comp = fitz.Pixmap(base, mask)
            im = Image.frombytes("RGBA", (comp.width, comp.height), comp.samples)
            extrema = im.getchannel("A").getextrema()
            if extrema[0] < 250:
                has_alpha = True
            else:
                im = im.convert("RGB")
            return im, has_alpha

    if base.alpha:
        im = Image.frombytes("RGBA", (base.width, base.height), base.samples)
        extrema = im.getchannel("A").getextrema()
        if extrema[0] < 250:
            has_alpha = True
        else:
            im = im.convert("RGB")
        return im, has_alpha

    im = Image.frombytes("RGB", (base.width, base.height), base.samples)
    return im, False


def is_flat_background(im: Image.Image, bw_ratio: float, bh_ratio: float, xref: int) -> bool:
    if xref in KNOWN_FLAT_BG_XREFS:
        return True
    w, h = im.size
    rgb = im.convert("RGB")
    stat = ImageStat.Stat(rgb)
    max_std = max(stat.stddev)
    if bw_ratio > 0.82 and bh_ratio > 0.82 and (max_std < 7.0 or max(w, h) < 700):
        return True
    if max_std < 3.0 and (bw_ratio > 0.4 or bh_ratio > 0.4):
        return True
    return False


def save_webp(im: Image.Image, dest: Path, max_side: int, quality: int, has_alpha: bool) -> tuple[int, int]:
    dest.parent.mkdir(parents=True, exist_ok=True)
    w, h = im.size
    mx = max(w, h)
    if mx > max_side:
        scale = max_side / mx
        nw, nh = max(1, int(round(w * scale))), max(1, int(round(h * scale)))
        im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    if has_alpha:
        im.save(dest, format="WEBP", quality=max(quality, 85), method=5)
    else:
        im.convert("RGB").save(dest, format="WEBP", quality=quality, method=5)
    return im.size


def build_portrait(dest: Path) -> dict:
    with Image.open(PORTRAIT_SRC) as im:
        im = im.convert("RGB")
        w, h = im.size
        x1 = int(round(0.11 * w))
        x2 = int(round(0.89 * w))
        crop_w = x2 - x1
        crop_h = int(round(crop_w * 4.0 / 3.0))
        y1 = int(round(0.055 * h))
        y2 = y1 + crop_h
        if y2 > h:
            y2 = h
            y1 = max(0, h - crop_h)
        cropped = im.crop((x1, y1, x2, y2)).resize((900, 1200), Image.Resampling.LANCZOS)
        dest.parent.mkdir(parents=True, exist_ok=True)
        cropped.save(dest, format="WEBP", quality=88, method=5)
    return {
        "src": "/portfolio-2025/meta/portrait-2026.webp",
        "width": 900,
        "height": 1200,
        "bytes": dest.stat().st_size,
    }


def main() -> None:
    if PUBLIC_OUT.exists():
        shutil.rmtree(PUBLIC_OUT)
    PUBLIC_OUT.mkdir(parents=True, exist_ok=True)
    MANIFEST_OUT.parent.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(PDF_PATH)
    manifest: dict = {"meta": {}, "projects": {}}

    # Build page-level xref -> smask helper
    def get_smask_map(page: fitz.Page) -> dict[int, int]:
        return {im[0]: im[1] for im in page.get_images(full=True)}

    # 1. Meta images
    meta_dir = PUBLIC_OUT / "meta"
    meta_specs = [
        ("cover-fluid", 1, None, 1920, 85),
        ("research-divider", 51, None, 1400, 84),
        ("commercial-divider", 73, None, 1400, 84),
    ]
    for name, pno, target_xref, max_side, qual in meta_specs:
        page = doc[pno - 1]
        sm_map = get_smask_map(page)
        infos = sorted(
            page.get_image_info(xrefs=True),
            key=lambda x: x["width"] * x["height"],
            reverse=True,
        )
        chosen = infos[0] if target_xref is None else next(i for i in infos if i["xref"] == target_xref)
        xref = chosen["xref"]
        im, has_alpha = pixmap_to_pil(doc, xref, sm_map.get(xref, 0))
        out_file = meta_dir / f"{name}.webp"
        rw, rh = save_webp(im, out_file, max_side, qual, has_alpha)
        manifest["meta"][name] = {
            "src": f"/portfolio-2025/meta/{name}.webp",
            "page": pno,
            "xref": xref,
            "width": rw,
            "height": rh,
            "bytes": out_file.stat().st_size,
            "has_alpha": has_alpha,
        }

    manifest["meta"]["portrait-2026"] = build_portrait(meta_dir / "portrait-2026.webp")

    # 2. Extract 17 project images per page
    total_files = 4
    total_bytes = sum(v["bytes"] for v in manifest["meta"].values())

    for slug, no, cat, title, prange in PROJECTS:
        proj_dir = PUBLIC_OUT / slug
        proj_dir.mkdir(parents=True, exist_ok=True)
        seen_xrefs: set[int] = set()
        pages_dict: dict[str, list[dict]] = {}

        for pno in prange:
            page = doc[pno - 1]
            pw, ph = page.rect.width, page.rect.height
            sm_map = get_smask_map(page)
            # Filter candidate placements
            raw_infos = page.get_image_info(xrefs=True)
            # Sort in natural top-to-bottom, left-to-right reading order
            raw_infos.sort(key=lambda it: (round(it["bbox"][1] / 24.0), round(it["bbox"][0] / 12.0)))

            valid_items: list[tuple[dict, Image.Image, bool]] = []
            for info in raw_infos:
                xref = info["xref"]
                w, h = info["width"], info["height"]
                if xref <= 0 or xref in seen_xrefs:
                    continue
                if min(w, h) < 48:
                    continue
                if w < 60 and h < 60:
                    continue
                bbox = info["bbox"]
                bw_ratio = (bbox[2] - bbox[0]) / pw
                bh_ratio = (bbox[3] - bbox[1]) / ph
                im, has_alpha = pixmap_to_pil(doc, xref, sm_map.get(xref, 0))
                if is_flat_background(im, bw_ratio, bh_ratio, xref):
                    continue
                seen_xrefs.add(xref)
                valid_items.append((info, im, has_alpha))

            is_dense_grid = len(valid_items) >= 15
            page_records: list[dict] = []
            for idx, (info, im, has_alpha) in enumerate(valid_items, 1):
                if pno == 7:
                    max_side, qual = 2200, 86
                elif is_dense_grid:
                    max_side, qual = 720, 80
                else:
                    max_side, qual = 1600, 82

                fname = f"p{pno:02d}-{idx:02d}.webp"
                dest = proj_dir / fname
                rw, rh = save_webp(im, dest, max_side, qual, has_alpha)
                sz = dest.stat().st_size
                total_files += 1
                total_bytes += sz
                bbox = info["bbox"]
                page_records.append(
                    {
                        "src": f"/portfolio-2025/{slug}/{fname}",
                        "file": fname,
                        "page": pno,
                        "xref": info["xref"],
                        "orig_w": info["width"],
                        "orig_h": info["height"],
                        "width": rw,
                        "height": rh,
                        "bytes": sz,
                        "has_alpha": has_alpha,
                        "bbox": [round(v, 1) for v in bbox],
                    }
                )
            pages_dict[f"p{pno:02d}"] = page_records

        manifest["projects"][slug] = {
            "no": no,
            "category": cat,
            "title": title,
            "pages": list(prange),
            "image_count": sum(len(v) for v in pages_dict.values()),
            "by_page": pages_dict,
        }
        print(
            f"{no} {slug:28s} -> {manifest['projects'][slug]['image_count']:3d} images"
        )

    with open(MANIFEST_OUT, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"\nTOTAL EXTRACTED IMAGES: {total_files}, TOTAL SIZE: {total_bytes / 1024 / 1024:.2f} MB")
    print(f"Manifest saved to: {MANIFEST_OUT}")

    # 3. Generate a 12-tile visual spot-check collage to inspect CMYK/RGBA/alpha fidelity
    samples = [
        ("portrait-2026", manifest["meta"]["portrait-2026"]["src"]),
        ("cover-fluid", manifest["meta"]["cover-fluid"]["src"]),
        ("p05-01 alpha", manifest["projects"]["01-millennium-phantom"]["by_page"]["p05"][0]["src"]),
        ("p07 genealogy", manifest["projects"]["01-millennium-phantom"]["by_page"]["p07"][0]["src"]),
        ("p15 dark", manifest["projects"]["02-sleepless"]["by_page"]["p15"][0]["src"]),
        ("p30 alchemy", manifest["projects"]["06-biological-alchemy"]["by_page"]["p30"][0]["src"]),
        ("p34 specimen", manifest["projects"]["06-biological-alchemy"]["by_page"]["p34"][0]["src"]),
        ("p36 desire", manifest["projects"]["07-national-arts-fund"]["by_page"]["p36"][0]["src"]),
        ("p63 yangliuqing", manifest["projects"]["10-yangliuqing-aigc"]["by_page"]["p63"][0]["src"]),
        ("p70 redchamber", manifest["projects"]["11-red-chamber-aesthetics"]["by_page"]["p70"][0]["src"]),
        ("p78 graduation", manifest["projects"]["14-tafa-2024-graduation"]["by_page"]["p78"][0]["src"]),
        ("p82 mayuan", manifest["projects"]["15-china-daily-ma-yuan"]["by_page"]["p82"][0]["src"]),
    ]
    cols, rows = 4, 3
    tw, th, pad = 340, 260, 12
    sheet = Image.new("RGB", (cols * (tw + pad) + pad, rows * (th + pad) + pad), (242, 240, 236))
    draw = ImageDraw.Draw(sheet)
    for idx, (label, rel_src) in enumerate(samples):
        fp = SITE_ROOT / "public" / rel_src.lstrip("/")
        r, c = divmod(idx, cols)
        x0, y0 = pad + c * (tw + pad), pad + r * (th + pad)
        with Image.open(fp) as sim:
            if sim.mode == "RGBA":
                bg = Image.new("RGBA", sim.size, (244, 242, 236, 255))
                bg.alpha_composite(sim)
                sim_rgb = bg.convert("RGB")
            else:
                sim_rgb = sim.convert("RGB")
            sim_rgb.thumbnail((tw, th - 22), Image.Resampling.LANCZOS)
            ox = x0 + (tw - sim_rgb.width) // 2
            oy = y0 + (th - 22 - sim_rgb.height) // 2
            sheet.paste(sim_rgb, (ox, oy))
        draw.rectangle([x0, y0 + th - 20, x0 + tw, y0 + th], fill=(28, 27, 25))
        draw.text((x0 + 6, y0 + th - 16), label, fill=(244, 242, 236))
    CONTACT_SHEET_OUT.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(CONTACT_SHEET_OUT, quality=88)
    print(f"Spot-check collage saved to: {CONTACT_SHEET_OUT}")


if __name__ == "__main__":
    main()
