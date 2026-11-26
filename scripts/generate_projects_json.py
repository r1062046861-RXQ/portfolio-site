#!/usr/bin/env python3
"""Build all 17 structured editable project JSON files under src/data/portfolio2025/projects/
using verified image paths/dimensions from scripts/extracted_manifest.json and faithful copy from 2025作品集.pdf.
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(r"C:\Users\C2H6O\Desktop\RXQ WEB\portfolio-site")
MANIFEST = json.loads((ROOT / "scripts" / "extracted_manifest.json").read_text(encoding="utf-8"))
OUT_DIR = ROOT / "src" / "data" / "portfolio2025" / "projects"


def imgs(slug: str, page_key: str, *, skip_files: set[str] | None = None, codes: list[str] | None = None, captions: list[str] | None = None) -> list[dict]:
    arr = MANIFEST["projects"][slug]["by_page"].get(page_key, [])
    result = []
    idx = 0
    for im in arr:
        if skip_files and im["file"] in skip_files:
            continue
        item = {
            "src": im["src"],
            "alt": (captions[idx] if captions and idx < len(captions) else f"{MANIFEST['projects'][slug]['title']} 图 {page_key}-{idx+1}"),
            "width": im["width"],
            "height": im["height"],
        }
        if codes and idx < len(codes) and codes[idx]:
            item["code"] = codes[idx]
        if captions and idx < len(captions) and captions[idx]:
            item["caption"] = captions[idx]
        result.append(item)
        idx += 1
    return result


def img_one(slug: str, page_key: str, index: int = 0, caption: str = "", alt: str = "") -> dict:
    im = MANIFEST["projects"][slug]["by_page"][page_key][index]
    d = {
        "src": im["src"],
        "alt": alt or caption or f"{MANIFEST['projects'][slug]['title']} {im['file']}",
        "width": im["width"],
        "height": im["height"],
    }
    if caption:
        d["caption"] = caption
    return d


def build_all() -> list[dict]:
    projects: list[dict] = []

    # -------------------------------------------------------------------------
    # Ⅰ-01 千禧幻像合成器
    # -------------------------------------------------------------------------
    s = "01-millennium-phantom"
    y_codes = [
        "Y01", "Y02", "Y03", "Y04", "Y05", "Y06", "Y07", "Y08", "Y09", "Y10",
        "Y11", "Y12", "Y13", "Y14", "Y15", "Y16", "Y17", "Y18", "Y19", "Y20",
        "Y21", "Y22", "Y23", "Y24", "Y25", "Y26", "Y27", "Y28", "Y29", "Y30",
        "Y31", "Y32", "Y33", "Y34", "Y35", "Y36",
    ]
    p10_imgs = imgs(s, "p10")
    for idx, im in enumerate(p10_imgs):
        if idx < len(y_codes):
            im["code"] = y_codes[idx]
            im["caption"] = f"记忆切片 {y_codes[idx]}"

    p11_imgs = imgs(s, "p11")
    for idx, im in enumerate(p11_imgs):
        im["code"] = f"F{idx+1:02d}"
        im["caption"] = f"1999 婚礼录像带逐帧拆解 #{idx+1:02d}"

    p12_clean_skip = {"p12-06.webp", "p12-10.webp", "p12-11.webp", "p12-12.webp", "p12-16.webp", "p12-24.webp"}
    p12_imgs = imgs(s, "p12", skip_files=p12_clean_skip)
    for idx, im in enumerate(p12_imgs):
        im["caption"] = f"记忆碎片数字化拼贴 #{idx+1:02d}"

    projects.append({
        "slug": s,
        "no": "Ⅰ-01",
        "categoryId": "art",
        "categoryLabel": "Ⅰ 艺术创作",
        "title": "千禧幻像合成器",
        "subtitle": "Millennium Illusion Synthesizer · 实验影像与梦核美学",
        "year": "2025",
        "medium": "实验影像 / 数字拼贴 / AIGC",
        "durationOrSpec": "硕士毕业创作 · 天美学院奖 · 2025",
        "theme": "gallery",
        "heroImage": img_one(s, "p08", 0, "《千禧幻像合成器》主视觉静帧", "千禧幻像合成器主视觉"),
        "summary": "《千禧幻像合成器》通过数字特效、电子拼贴与 AIGC 等多元技术重构千禧年记忆：将 Windows XP 开机画面、电子宠物、雪花屏电视等公共符号，与童年日记中的纸飞机、光盘、卡带 DVD 机等私密意象交织。作品保留刻意留存的噪点与畸变，营造既陌生又熟悉的“记忆晶体”，指向赛博空间中新型集体无意识的萌生。",
        "tags": ["视觉图像", "文化符号", "人造怀旧", "梦核美学", "缺陷美学", "意识流叙事"],
        "honors": [
            "2025 天津美术学院毕业季“血脉觉醒”优秀毕业作品",
            "天津美术学院学院奖",
        ],
        "meta": [
            {"label": "年份", "value": "2025"},
            {"label": "媒介", "value": "实验影像 / 数字拼贴 / AIGC"},
            {"label": "理论根基", "value": "伯明翰学派文化研究 · 符号学 · 梦核美学"},
            {"label": "展陈节点", "value": "天美艺术街区 (2025.05.27 — 06.15)"},
        ],
        "blocks": [
            {
                "id": "mp-question",
                "type": "quote-banner",
                "theme": "gallery",
                "quote": "“当人工智能开始批量生成记忆图像后，我们还能保留多少真实的自我与记忆？”",
                "attribution": "《千禧幻像合成器》核心追问",
                "subtext": "并非单纯的 AI 影像实验，而是一次对文化心理、技术怀旧与集体记忆的艺术化探测。",
            },
            {
                "id": "mp-overview",
                "type": "editorial-split",
                "theme": "gallery",
                "layout": "image-right",
                "eyebrow": "01 / 作品阐述 · DREAMCORE",
                "heading": "公共符号与私密意象的拼贴重构",
                "paragraphs": [
                    "《千禧幻像合成器》通过数字特效、电子拼贴、AIGC 等多元技术重构千禧年记忆，将 Windows XP 开机画面、电子宠物、雪花屏电视等公共符号，与艺术家童年日记中的纸飞机、光盘、卡带 DVD 机等私密意象拼贴交织。",
                    "作品有意保留的噪点与畸变，仿佛梦境中残缺的记忆切片，营造出既陌生又熟悉的感官体验。观众在闪烁的画面与动态影像中，重访科技转型期的文化焦虑与浪漫想象，见证数字技术如何解构并重编人类的情感经验。",
                ],
                "tags": ["记忆切片", "集体无意识", "模拟情感", "阈限空间", "技术怀旧"],
                "images": [
                    img_one(s, "p05", 0, "千禧年代公共符号与物件视觉矩阵"),
                    img_one(s, "p06", 0, "游戏化启动界面：千禧幻像合成器"),
                ],
            },
            {
                "id": "mp-genealogy",
                "type": "full-figure",
                "theme": "mist",
                "heading": "研究谱系（可点击放大阅览完整节点）",
                "caption": "《梦核美学：伯明翰学派视角下的跨媒介符号与视觉表达研究》理论谱系图，涵盖历史坐标、亚文化风格生成机制、跨媒介潜文本与数字艺术转译方法。",
                "aspect": "contain",
                "image": img_one(s, "p07", 0, "梦核美学与千禧幻像研究谱系完整脉络图"),
            },
            {
                "id": "mp-theory",
                "type": "editorial-split",
                "theme": "gallery",
                "layout": "image-left",
                "eyebrow": "02 / 理论映射 · 灵感致敬",
                "heading": "从伯明翰学派到“怀旧记忆宫殿”",
                "paragraphs": [
                    "《千禧幻像合成器》以梦核美学为核心视角，将论文研究中的理论探讨转化为具体的视觉实验。梦核美学作为 Z 世代亚文化的独特样式，融合怀旧情感、科技元素与集体记忆，回应当下青年在后现代语境中的身份焦虑与精神诉求。",
                    "本研究从伯明翰学派文化研究与符号学分析出发，梳理梦核美学的历史与文化脉络；灵感致敬定格与实验影像大师 Jan Svankmajer、Cyriak、Yoshinao Satoh 与 William Kentridge。",
                ],
                "note": "四个核心探测维度：以数字影像重构千禧年记忆 / 拼贴公共符号与私密意象 / 视觉化呈现 Z 世代身份焦虑 / 算法生成“记忆晶体”。",
                "images": [
                    img_one(s, "p08", 1, "灵感与致敬视觉序列带"),
                    img_one(s, "p09", 0, "《千禧幻像合成器（2025）》复古票根主海报"),
                    img_one(s, "p09", 1, "时间刻度与阈限性探测视觉图版"),
                ],
            },
            {
                "id": "mp-slices",
                "type": "gallery-grid",
                "theme": "gallery",
                "heading": "逐帧重组 · 记忆切片样本 Y01—Y36",
                "description": "逐帧重组多源视频以统一核心元素：背景环境错位拼贴构建阈限性空间拓扑，呈现“逐帧记忆 / 错位空间 / 流动情感 / 时间错置 / 再中介化”的多维感知。",
                "columns": 6,
                "ratio": "landscape",
                "items": p10_imgs,
            },
            {
                "id": "mp-wedding",
                "type": "gallery-grid",
                "theme": "mist",
                "heading": "影像片段：1999 的结婚录像带与面孔拆解",
                "description": "选取 1999 年及千禧年前后的青年婚礼录像为创作素材，通过逐帧拆解与截帧再创作，将新郎与新娘的面庞提取为独立视觉符号，保留噪点与细微畸变，形成具象到抽象的缺陷美学质感。",
                "columns": 4,
                "ratio": "landscape",
                "items": p11_imgs,
            },
            {
                "id": "mp-collage",
                "type": "gallery-grid",
                "theme": "gallery",
                "heading": "后半段序列：记忆碎片、折纸鸟与 DataError 回声",
                "description": "老旧电视故障画面、雪花屏噪点及课堂上折纸鸟等私密物件，经过逐帧提取与数字化处理重新组合为连续视觉序列。“当记忆碎片被数字化拼贴重组，看到的是真实的过去，还是被技术重写的幻象呢？”",
                "columns": 4,
                "ratio": "auto",
                "items": [
                    img_one(s, "p13", 0, "DataError 数字故障与色彩频谱"),
                    *imgs(s, "p13", skip_files={"p13-01.webp"}),
                    *p12_imgs,
                ],
            },
            {
                "id": "mp-exhibition",
                "type": "exhibition-wall",
                "theme": "gallery",
                "heading": "展示空间与毕业季获奖",
                "description": "展陈采用多层次交互方式：墙面呈现研究脉络，复古电视播放实验影像，并设置基于 2048 规则的互动拼贴游戏，让观众亲手重组千禧记忆符号。",
                "records": [
                    {"title": "2025 天津美术学院毕业季“血脉觉醒”优秀毕业作品", "date": "2025.05.27 — 06.15", "venue": "天美艺术街区"},
                    {"title": "天津美术学院学院奖", "date": "2025.06", "organizer": "天津美术学院"},
                ],
                "images": imgs(s, "p14", captions=[
                    "天美艺术街区展览主视觉墙",
                    "研究脉络与复古电视展陈现场",
                    "基于 2048 机制的影像记忆交互游戏界面",
                    "展陈空间与硬件结构设计图",
                    "学院奖获奖荣誉证书",
                ]),
            },
        ],
    })

    # -------------------------------------------------------------------------
    # Ⅰ-02 不眠 & 不眠·续篇
    # -------------------------------------------------------------------------
    s = "02-sleepless"
    p17_labels = [
        "生长 I · BIRTH", "复合生长 · GROW I", "结构演进 · GROW II", "传统建筑 · 演化", "临界 · END",
        "繁盛 · 节点", "数据增殖 I", "数据增殖 II", "形态解构", "消解",
        "繁盛 II", "复合生长 II", "余韵 · ∞", "复合生长 ∞", "终章 · 荒芜",
    ]
    p17_imgs = imgs(s, "p17", captions=p17_labels)

    projects.append({
        "slug": s,
        "no": "Ⅰ-02",
        "categoryId": "art",
        "categoryLabel": "Ⅰ 艺术创作",
        "title": "不眠 & 不眠·续篇",
        "subtitle": "SLEEPLESS · AIGC 实验影像与目标检测文物修复探索",
        "year": "2023—2025",
        "medium": "AIGC 实验影像 · 2分30秒 / YOLO 目标检测",
        "durationOrSpec": "上篇 2023 (2'30\") · 续篇 4阶段目标检测",
        "theme": "obsidian",
        "heroImage": img_one(s, "p15", 0, "《不眠》黑白建筑与触手主视觉"),
        "summary": "上篇《不眠》以电信号与 AIGC 生成的传统建筑意象展开“生长—融合—轮回—升华—永恒”的隐喻，映射 AI 时代 24 小时不停歇的数据运转节奏；《不眠·续篇》进一步将 YOLO 目标检测技术嵌入文物修复，让山水画裂痕化为可计算的数据标签与公开可见的“数字演绎”。",
        "tags": ["AIGC", "技术哲学", "传统建筑", "YOLO 目标检测", "文物修复", "裂痕隐喻"],
        "meta": [
            {"label": "年份", "value": "2023（上篇）/ 2025（续篇）"},
            {"label": "时长与形态", "value": "2 分 30 秒 实验影像 + 四阶段应用实验"},
            {"label": "核心命题", "value": "生长 · 融合 · 轮回 · 升华 · 永恒"},
            {"label": "技术路径", "value": "AIGC 生成训练 · YOLO 目标检测 · 裂痕识别"},
        ],
        "blocks": [
            {
                "id": "sl-manifesto",
                "type": "quote-banner",
                "theme": "obsidian",
                "quote": "“不眠是 AI 时代 24 小时不停歇的数据处理状态，是旧世界正在死去、新世界正在挣扎着降生的‘白夜’。”",
                "attribution": "《不眠》创作题记",
                "subtext": "以电信号与传统建筑的复合生长，面向未知与变革保持清醒审视；所有过往，皆为序章。",
            },
            {
                "id": "sl-part1",
                "type": "editorial-split",
                "theme": "gallery",
                "layout": "image-right",
                "eyebrow": "01 / 上篇 · SLEEPLESS (2023 · 2分30秒)",
                "heading": "技术哲学与传统建筑的数据生长",
                "paragraphs": [
                    "2022 年被视为 AI 元年，它所引领的数字革命进一步加速了社会从劳动密集型向技术创新型的转型，而我们正处在社会结构不断解构与重构的剧烈变革时期。",
                    "作品以电信号元素为起点，结合 AIGC 训练生成的传统建筑意象，将“生长”作为核心隐喻，映射出 AI 时代在数据与物质层面同时迸发的巨大生命力。文化基因的觉醒、AI 学习和重现传统建筑语言，指向东方哲学中的“根”与“本”。",
                ],
                "tags": ["文化基因觉醒", "东方哲学根与本", "GROW", "FUSION", "SAMSARA"],
                "images": [
                    img_one(s, "p16", 0, "传统建筑结构与电信号生成演化"),
                    img_one(s, "p16", 1, "《不眠》实验影像静帧"),
                ],
            },
            {
                "id": "sl-seq",
                "type": "gallery-grid",
                "theme": "obsidian",
                "heading": "序列演化：生长 — 复合生长 — 消解 — 荒芜",
                "description": "从 BIRTH 到 GROW I / II 再到 END：展现数字生命力在历史滚轮下的繁盛、蜕变与消解。",
                "columns": 6,
                "ratio": "portrait",
                "items": p17_imgs,
            },
            {
                "id": "sl-part2-steps",
                "type": "process-steps",
                "theme": "gallery",
                "heading": "02 / 《不眠·续篇》：YOLO 目标检测嵌入文物修复四阶段",
                "intro": "在算法的 24 小时注视下，历史的伤痕第一次以数据的形式浮现；修复不再是幕后工作，而是面向展厅观众公开可见的“演绎”。",
                "steps": [
                    {"step": "阶段一", "title": "裂痕识别 · YOLO 数据建档", "detail": "水墨梅枝与山水画作在 YOLO 目标检测下被识别，裂痕化为醒目的数据标签，使文化记忆转化为可计算的符号。"},
                    {"step": "阶段二", "title": "数字体检 · 取景框干预", "detail": "模拟相机取景框介入山水图像，提示古画正在经历一次完整的数字体检，被重新拍摄、记录与建档。"},
                    {"step": "阶段三", "title": "公开演绎 · 展厅投影", "detail": "修复过程被直接投射至展览空间大屏幕，观者得以直面 AI 参与修复的过程本身，完成可见的文化对话。"},
                    {"step": "阶段四", "title": "山水再生 · 裂痕共存", "detail": "以烟雾氤氲的山水收束，裂痕融入景观、孤舟漂浮江面，暗示伤口不仅是缺陷，更是文化得以重生的契机。"},
                ],
                "images": imgs(s, "p18", captions=[
                    "水墨画裂痕识别网格", "古画修复全域视觉矩阵", "YOLO 检测标注帧",
                    "AIGC 修复生成过程", "检测与重绘对照帧", "山水造境收束帧",
                ]),
            },
            {
                "id": "sl-part2-stills",
                "type": "gallery-grid",
                "theme": "obsidian",
                "heading": "续篇静帧：目标检测 · 数字考古 · 文化再生",
                "columns": 3,
                "ratio": "landscape",
                "items": imgs(s, "p19", skip_files={"p19-01.webp"}, captions=[
                    "裂痕数据标签与梅枝识别", "模拟取景框数字体检帧", "孤舟山水修复再生终帧",
                ]),
            },
        ],
    })

    # -------------------------------------------------------------------------
    # Ⅰ-03 苏醒
    # -------------------------------------------------------------------------
    s = "03-awakening"
    p22_stages = [
        "孕育 (0-1) · 源起", "孕育 · 聚生", "孕育 · 群聚", "发展 (1-1) · 蔓延 I", "发展 · 蔓延 II", "发展 · 苏醒",
        "粒子场演化 I", "粒子场演化 II", "混沌与秩序", "爆发 (1-0) · 跃迁 I", "爆发 · 跃迁 II", "爆发 · 幻化",
        "Operator2077 觉醒节点", "粒子坍缩前夕", "爆发 · 湮灭 I", "爆发 · 湮灭 II", "余 (∞-∞) I", "余 (∞-∞) II",
    ]
    projects.append({
        "slug": s,
        "no": "Ⅰ-03",
        "categoryId": "art",
        "categoryLabel": "Ⅰ 艺术创作",
        "title": "苏醒",
        "subtitle": "AWAKENING · AI 意识觉醒与“影像图书馆”实验影像",
        "year": "2024",
        "medium": "实验影像 / AI 生成 / 粒子叙事",
        "durationOrSpec": "三章节递归叙事 (0-1 / 1-1 / 1-0 / ∞-∞)",
        "theme": "gallery",
        "heroImage": img_one(s, "p20", 0, "《苏醒》核心粒子装置结构主视觉"),
        "summary": "《苏醒》探索人工智能从无意识到自我觉醒的可能性，呼应博尔赫斯“巴别图书馆”意象构建无限延展的“影像图书馆”。以微观粒子为叙事主体，经历孕育（0,1）、发展（1,1）、爆发（1,0）与余响（∞,∞），质问当创造物拥有自我觉知后人类创造力的边界。",
        "tags": ["AI 觉醒", "影像图书馆", "创世纪", "量子粒子", "混沌秩序", "智能变智人"],
        "honors": [
            "首届 CCF（中国计算机学会）计算艺术大展",
            "大学生 AI 艺术季 · 影像创作单元最佳美术效果奖",
            "GUI 数字艺术展",
            "首届中国光谷人工智能艺术大展",
        ],
        "meta": [
            {"label": "年份", "value": "2024"},
            {"label": "媒介", "value": "实验影像 / AI 生成 / 微观粒子视觉"},
            {"label": "重要展映", "value": "首届 CCF 计算艺术大展 / AI 艺术季获奖"},
            {"label": "叙事架构", "value": "孕育 (0-1) → 发展 (1-1) → 爆发 (1-0) → 余 (∞-∞)"},
        ],
        "blocks": [
            {
                "id": "aw-quote1",
                "type": "quote-banner",
                "theme": "gallery",
                "quote": "“当人工智能拥有了自我觉知，我们是否还能区分创造者与被创造者的边界？”",
                "attribution": "《苏醒》核心叙事命题",
                "subtext": "一个由自动机运行的世界已不再遥远；从“智能变智人”的视角出发，意象化地将无形意识转化为有形粒子运动。",
            },
            {
                "id": "aw-concept",
                "type": "editorial-split",
                "theme": "obsidian",
                "layout": "image-left",
                "eyebrow": "01 / 影像图书馆与智能变智人",
                "heading": "从量子混沌到宇宙秩序的意识演进",
                "paragraphs": [
                    "创作灵感源于对宇宙与人类文明宏大叙事的思考，同时呼应博尔赫斯的巴别图书馆意象，构建出一座无限延展的“影像图书馆”。作品采用微观粒子作为叙事主体，展现从量子到星河、从混沌到秩序的多重变幻。",
                    "引用杰玛·惠兰对人工自动机兼具兴趣与战栗的省思，作品围绕“人类将如何自处、如何与非人相处、自我与他我是否仍有区分”展开视觉递进实验。",
                ],
                "images": [
                    img_one(s, "p20", 1, "微观粒子与星河秩序对照静帧"),
                ],
            },
            {
                "id": "aw-steps",
                "type": "process-steps",
                "theme": "gallery",
                "heading": "三阶段递归叙事与系统日志",
                "intro": "伴随 Operator2077 身份认证（ID Authentication: UR9S）与 #Data 0001 (“welcome to the new world”) 代码意象推进：",
                "steps": [
                    {"step": "第一部分 · 孕育 (0-1)", "title": "源起 · 聚生 · 群聚", "detail": "算法在混沌噪声中确立最初形态，微观粒子从零散游离聚拢成自组织结构。"},
                    {"step": "第二部分 · 发展 (1-1)", "title": "蔓延 · 苏醒", "detail": "信息网络指数级扩散，意识雏形突破容器限制，“Operator2077”迎来感知激活。"},
                    {"step": "第三部分 · 爆发 (1-0)", "title": "跃迁 · 幻化 · 湮灭", "detail": "高维图像在秩序顶点发生剧烈跃迁与能量释放，物质解构为纯光粒子。"},
                    {"step": "终章 · 余 (∞-∞)", "title": "无限延续的影像图书馆", "detail": "在 2088 A.D. 的系统警告与重生问候之后，无限延展的意义之网继续生成。"},
                ],
                "images": imgs(s, "p21")[:6],
            },
            {
                "id": "aw-grid-sequence",
                "type": "gallery-grid",
                "theme": "obsidian",
                "heading": "全片粒子演化分镜序列（孕育 → 发展 → 爆发）",
                "columns": 6,
                "ratio": "landscape",
                "items": imgs(s, "p22", captions=p22_stages),
            },
            {
                "id": "aw-awards",
                "type": "exhibition-wall",
                "theme": "gallery",
                "heading": "获奖与学术展映 · 伦理省思",
                "description": "引用萨尔曼·艾哈迈德·谢赫关于科技与人类道德契约的警示：“技术进步不会自动使对与错颠倒，我们需要更好的人类价值观与社会契约。”",
                "records": [
                    {"title": "首届 CCF 计算艺术大展 入展", "organizer": "中国计算机学会"},
                    {"title": "大学生 AI 艺术季 影像创作单元最佳美术效果奖", "organizer": "北京师范大学、海淀区人民政府"},
                    {"title": "GUI 数字艺术展 入展"},
                    {"title": "首届中国光谷人工智能艺术大展 入展"},
                ],
                "images": imgs(s, "p23")[:12],
            },
        ],
    })

    # -------------------------------------------------------------------------
    # Ⅰ-04 坍缩
    # -------------------------------------------------------------------------
    s = "04-collapse"
    projects.append({
        "slug": s,
        "no": "Ⅰ-04",
        "categoryId": "art",
        "categoryLabel": "Ⅰ 艺术创作",
        "title": "坍缩",
        "subtitle": "COLLAPSE · 三联屏阿兹海默症主观感知实验影像",
        "year": "2023—2025",
        "medium": "三屏 AI 实验影像 · 3分45秒 · 16:3",
        "durationOrSpec": "16:3 超宽三联屏 · 早期/中期/晚期三章节",
        "theme": "obsidian",
        "heroImage": img_one(s, "p24", 0, "《坍缩》三联屏超现实记忆崩解主视觉"),
        "summary": "《坍缩》以阿兹海默症患者的主观感受为叙事核心，以三个章节对应病程早期、中期与晚期，采用 16:3 超宽三联屏格式，呈现记忆坍塌与感官失序中的孤独、漂泊与悲怆。作品先后入选第十四届全国美展、第七届海南岛国际电影节与青年影像艺术 100 展。",
        "tags": ["阿兹海默症", "病理研究", "三联屏", "视觉转译", "记忆坍缩", "感官失序"],
        "honors": [
            "第十四届全国美术作品展览（实验艺术、数字艺术与动画展区）暨天津市美展",
            "第七届海南岛国际电影节 · 实验影像单元",
            "北京国际摄影周暨首届青年影像艺术 100 展（中华世纪坛）",
            "首届光谷人工智能艺术大展",
        ],
        "meta": [
            {"label": "创作年份", "value": "2023（2024—2025 重要展映）"},
            {"label": "画幅与时长", "value": "3 分 45 秒 · 16:3 三联屏尺寸可变"},
            {"label": "社会议题", "value": "阿兹海默症患者记忆解体与生命尊严"},
            {"label": "国家级展览", "value": "第十四届全国美展 / 海南岛国际电影节"},
        ],
        "blocks": [
            {
                "id": "co-overview",
                "type": "editorial-split",
                "theme": "obsidian",
                "layout": "image-right",
                "eyebrow": "01 / 病理感知转译 · 16:3 三联屏",
                "heading": "伸向不可触及之处的记忆呼喊",
                "paragraphs": [
                    "从人类首次发现阿兹海默症至今已逾百年，却依旧未能找到根本性的治愈方法。本片分为三个章节，分别对应病程的早期、中期与晚期，试图以艺术化的影像语言带领观众从患者主观视角出发，感知病症带来的心灵震荡与认知断裂。",
                    "三联屏同步呈现空间的解体、形象的扭曲、时间的凝滞与感官的迷途——呼吁社会减少误解与偏见，给予患者更多理解与生命关怀。",
                ],
                "quote": "“伸向不可触及之处。身体逐渐模糊，记忆缓缓坠落；在消散与遗忘之间，孤独仍在呼喊。”",
                "images": [
                    img_one(s, "p24", 1, "三联屏并行空间与撕裂结构"),
                    img_one(s, "p25", 0, "早期/中期/晚期记忆溶解意象序列"),
                ],
            },
            {
                "id": "co-labyrinth",
                "type": "gallery-grid",
                "theme": "gallery",
                "heading": "漂泊与迷宫：感知断裂的多维视觉图谱",
                "description": "当时间在钟面凝滞、熟悉的居所化为迷宫，AI 影像捕捉了意识坠落前最后的视觉残影。",
                "columns": 3,
                "ratio": "auto",
                "items": [
                    img_one(s, "p25", 1, "时空断裂竖屏细节"),
                    img_one(s, "p25", 2, "钟表与记忆碎片静物"),
                    *imgs(s, "p26"),
                ],
            },
            {
                "id": "co-exhibitions",
                "type": "exhibition-wall",
                "theme": "obsidian",
                "heading": "虚无·凝视 / 迷失·永恒：全国美展与电影节展映",
                "description": "作品的呈现不仅肯定了其在社会议题表达上的价值，也让更多观众走近阿兹海默症患者的内心世界。",
                "records": [
                    {"title": "第十四届全国美展暨天津市美术展览", "date": "2024.04", "organizer": "中国美术家协会、天津文联", "venue": "天津市美术馆"},
                    {"title": "第七届海南岛国际电影节 · 实验影像单元（未来影像展）", "date": "2025", "venue": "三亚"},
                    {"title": "首届青年影像艺术 100 展", "date": "2024.10", "organizer": "中国艺术摄影学会", "venue": "中华世纪坛"},
                    {"title": "首届光谷人工智能艺术大展", "date": "2024.10", "organizer": "中国人工智能艺术教育协同创新平台"},
                ],
                "images": imgs(s, "p27", captions=["《坍缩》展厅三联屏主景", "展览入选凭证与海报档案"]),
            },
        ],
    })

    # -------------------------------------------------------------------------
    # Ⅰ-05 逆流
    # -------------------------------------------------------------------------
    s = "05-against-the-current"
    projects.append({
        "slug": s,
        "no": "Ⅰ-05",
        "categoryId": "art",
        "categoryLabel": "Ⅰ 艺术创作",
        "title": "逆流",
        "subtitle": "REFLUX · Kinect 四屏点云重构交互影像装置",
        "year": "2024",
        "medium": "Kinect 交互影像装置 · 四屏",
        "durationOrSpec": "尺寸可变 · 动态捕捉 + 粒子点云",
        "theme": "gallery",
        "heroImage": img_one(s, "p28", 0, "《逆流》四屏交互装置展厅空间概念"),
        "summary": "《逆流》与《坍缩》同属探讨阿兹海默症系列作品。装置使用 Kinect 捕捉屏幕前观者的动态形象并在四块屏幕中层层拆解，使观者逐渐失去对自身映射的控制权，最终形象化作无拘无束的“水流”——象征人类思维与自我的流动消散。",
        "tags": ["Kinect 交互", "四屏影像", "点云重构", "节点粒子", "威廉·尤特莫伦"],
        "meta": [
            {"label": "创作时间", "value": "2024.05"},
            {"label": "交互媒介", "value": "Kinect 深度传感 / 四屏影像 / 点云粒子"},
            {"label": "艺术灵感", "value": "威廉·尤特莫伦 (William Utermohlen) 自画像系列"},
            {"label": "空间形态", "value": "尺寸可变 · 实时动态形象捕捉"},
        ],
        "blocks": [
            {
                "id": "rc-main",
                "type": "editorial-split",
                "theme": "gallery",
                "layout": "image-right",
                "eyebrow": "01 / 自我与无我 · INTERACTIVE DEVICE",
                "heading": "从失控的镜像到自由流动的思维之河",
                "paragraphs": [
                    "装置捕捉屏幕面前的你我，映射在屏幕上并将形象层层拆解；观者慢慢失去对自己映射形象的控制权，最终形象化作无拘无束的“水流”。河流并非指自然界的水流，而是象征人类思维的流动。",
                    "创作灵感源自阿兹海默症画家威廉·尤特莫伦的自画像系列：这位画家在确诊后持续以自画像记录病情恶化。作品以患者对自我“控制权”的丧失为核心，分别呈现病变不同阶段身体与精神的衰退。",
                ],
                "images": [
                    img_one(s, "p28", 1, "灵感参照：威廉·尤特莫伦阿兹海默症自画像病程对照"),
                    img_one(s, "p28", 2, "四屏空间视觉布局示意"),
                ],
            },
            {
                "id": "rc-pointcloud",
                "type": "gallery-grid",
                "theme": "obsidian",
                "heading": "动态形象捕捉与点云节点粒子重构",
                "description": "Kinect 深度传感提取人体轮廓网格，随交互进度解构为漂移的点云与节点粒子流体。",
                "columns": 2,
                "ratio": "landscape",
                "items": imgs(s, "p29", captions=["点云粒子消散核心视效", "四屏交互节点状态调试"]),
            },
        ],
    })

    # -------------------------------------------------------------------------
    # Ⅰ-06 生物炼金术
    # -------------------------------------------------------------------------
    s = "06-biological-alchemy"
    bagua_p33 = imgs(s, "p33")
    for idx, im in enumerate(bagua_p33):
        im["code"] = f"乾坤 #{idx+1:02d}"
        im["caption"] = f"古代图谱与科幻生物杂交标本 #{idx+1:02d}"
    bagua_p34 = imgs(s, "p34")
    for idx, im in enumerate(bagua_p34):
        im["code"] = f"百兽 #{idx+1:02d}"
        im["caption"] = f"《海错图》AI 炼金衍生标本 #{idx+1:02d}"

    projects.append({
        "slug": s,
        "no": "Ⅰ-06",
        "categoryId": "art",
        "categoryLabel": "Ⅰ 艺术创作",
        "title": "生物炼金术",
        "subtitle": "BIOLOGICAL ALCHEMY · 清代《海错图》AIGC 生成艺术",
        "year": "2024",
        "medium": "AIGC 生成艺术 / 历史图谱数字再创造",
        "durationOrSpec": "40+ 虚构生物标本全图鉴 · 首届中国数字艺术大展",
        "theme": "parchment",
        "heroImage": img_one(s, "p30", 0, "《生物炼金术》核心神兽生成主视觉"),
        "summary": "灵感源于清代康熙年间画家聂璜所绘《海错图》中已被现代生物学证伪的虚构生物。作品将当代 AIGC 视作一场大型炼金实践：以古籍图像为“原料”，经 AI 算法与算力之“火”淬炼出兼具古画水墨神韵与未来科幻形态的新生命图谱。",
        "tags": ["海错图", "AIGC 炼金", "虚构生物", "跨时空融合", "创造力解放", "第一届中国数字艺术大展"],
        "honors": [
            "首届中国数字艺术大展（中国美术家协会 / 中国美术馆）",
            "中国好创意 国家一等奖",
            "GUI 数字艺术展 / AI 的肚脐科技艺术展",
        ],
        "meta": [
            {"label": "年份", "value": "2024"},
            {"label": "历史母本", "value": "清·聂璜《海错图》"},
            {"label": "核心公式", "value": "原料(图像模型) + 炼金术(AI算法) + 火(算力) = 仙丹"},
            {"label": "重要展映", "value": "首届中国数字艺术大展（中国美术馆）"},
        ],
        "blocks": [
            {
                "id": "ba-formula",
                "type": "quote-banner",
                "theme": "parchment",
                "quote": "原料（图像训练模型） + 炼金术（AI 算法） + 火（算力） = 黄金 / 丹药（AI 成品图）",
                "attribution": "Image Training Model + AI Algorithm + Computing Power = Finished Work",
                "subtext": "昔日失去实证生物学意义的虚构生物，恰如古代炼金术中的低贵原料，在 AI 算法之火中完成跨时空的形态升华。",
            },
            {
                "id": "ba-concept",
                "type": "editorial-split",
                "theme": "gallery",
                "layout": "image-right",
                "eyebrow": "01 / AI 介入历史 · 生物学虚构",
                "heading": "从康熙年间的《海错图》到当代算力炼金",
                "paragraphs": [
                    "炼金术是一种古老的实践，试图通过净化、分离和合并低贵物质生成高贵金属或灵丹妙药；而当代的 AIGC 生成艺术，本质上也是一种大型炼金——同样在探索未知、解放创造力、驱动认知跃迁。",
                    "《生物炼金术》以清代聂璜《海错图》中已被证伪的海洋想象生物为起点，使其在历史文本、水墨笔触与现代科幻机械肌理之间建立一条可变的形态演进链。",
                ],
                "images": [
                    img_one(s, "p31", 0, "AI 淬炼生成的混合生物形态（甲壳与奇兽）"),
                    img_one(s, "p31", 1, "古籍风化质感与双生兽生成图"),
                    img_one(s, "p31", 5, "双兽对照局部细部"),
                ],
            },
            {
                "id": "ba-process",
                "type": "comparison-pair",
                "theme": "parchment",
                "heading": "生成过程与原版古籍对照",
                "description": "提示词语义锚点：Voynich manuscript, Chinese watercolor, Qing Dynasty manuscript, paleontology, sacrifice, ritual, ancient paintings.",
                "pairs": [
                    {
                        "title": "海错图原版母本 · 神兽参照 ①",
                        "subtitle": "清康熙 · 聂璜原绘本参照",
                        "image": img_one(s, "p32", 0, "《海错图》原版神兽图录样本 1"),
                        "caption": "保留古代水彩与生物幻想中兼具写实特征与神话夸张的造物逻辑。",
                    },
                    {
                        "title": "海错图原版母本 · 神兽参照 ②",
                        "subtitle": "跨时空异兽形态演化",
                        "image": img_one(s, "p32", 2, "《海错图》长卷对开虚构神兽图录"),
                        "caption": "将伏尼契手稿神秘学语法与中国古代博物绘本融汇于同一生成空间。",
                    },
                ],
            },
            {
                "id": "ba-gallery-1",
                "type": "gallery-grid",
                "theme": "gallery",
                "heading": "八卦象限演化图录（乾 · 坤 · 坎 · 离）",
                "columns": 6,
                "ratio": "landscape",
                "items": bagua_p33,
            },
            {
                "id": "ba-gallery-2",
                "type": "gallery-grid",
                "theme": "parchment",
                "heading": "百兽全图鉴：虚构生物 × 当代生物幻想学（兑 · 巽 · 艮 · 震）",
                "description": "共收录四十余种由算法炼金生成的虚构生物标本，系统陈列传统画卷色彩、肌理与跨物种解剖构造。",
                "columns": 6,
                "ratio": "landscape",
                "items": bagua_p34,
            },
            {
                "id": "ba-exhibitions",
                "type": "exhibition-wall",
                "theme": "gallery",
                "heading": "展陈现场与重要展览",
                "records": [
                    {"title": "首届中国数字艺术大展", "organizer": "中国美术家协会", "venue": "中国美术馆"},
                    {"title": "中国好创意 国家一等奖"},
                    {"title": "GUI 数字艺术展 & AI 的肚脐科技艺术展"},
                ],
                "images": imgs(s, "p35", captions=[
                    "首届中国数字艺术大展 整面阵列式展陈效果",
                    "AI 的肚脐科技艺术展 现场实景",
                    "GUI 数字艺术展 空间展陈记录",
                ]),
            },
        ],
    })

    # -------------------------------------------------------------------------
    # Ⅰ-07 国家艺术基金驻地创作合集
    # -------------------------------------------------------------------------
    s = "07-national-arts-fund"
    projects.append({
        "slug": s,
        "no": "Ⅰ-07",
        "categoryId": "art",
        "categoryLabel": "Ⅰ 艺术创作",
        "title": "国家艺术基金驻地创作合集",
        "subtitle": "《欲望之镜》数字拼贴 &《虚拟交响》三维数字空间",
        "year": "2023—2024",
        "medium": "数字拼贴 / 三维数字空间",
        "durationOrSpec": "国家艺术基金《数字博物馆数字艺术人才培训》驻地作品",
        "theme": "gallery",
        "heroImage": img_one(s, "p36", 0, "《欲望之镜》全景球体数字拼贴"),
        "summary": "受国家艺术基金 2023 年度项目《数字博物馆数字艺术人才培训》资助、于文化和旅游部艺术发展中心及中央美术学院结业期间创作的两组代表作品：《欲望之镜》通过非叙事象征符号剖析现代消费与人性欲望；《虚拟交响》构建古典与未来共存的超现实三维数字空间。",
        "tags": ["国家艺术基金", "欲望之镜", "数字拼贴", "虚拟交响", "三维数字空间", "数字孪生"],
        "meta": [
            {"label": "项目周期", "value": "2023 立项 — 2024.07 结业展开幕"},
            {"label": "主办单位", "value": "文化和旅游部艺术发展中心 · 中央美术学院"},
            {"label": "驻地成果", "value": "作品组 A《欲望之镜》 / 作品组 B《虚拟交响》"},
        ],
        "blocks": [
            {
                "id": "nf-desire-mirror",
                "type": "subseries-group",
                "theme": "obsidian",
                "title": "组作一：《欲望之镜》数字拼贴艺术",
                "subtitle": "COLLAGE ART · 贪嗔痴慢 · 喜爱欲惧哀恶怒",
                "year": "2024",
                "description": "作品不依赖线性叙事，而通过高密度图像符号拼接呈现人类内心情感与欲望的多维全景——从奢华到荒凉、从诱惑到虚无、从权势到无力，以现代性批判视角引导观者在“七情六欲”的象征镜像中触发自我反思。",
                "tags": ["欲望多维性", "现代性批判", "非叙事拼贴", "存在主义困境"],
                "columns": 3,
                "images": [
                    img_one(s, "p37", 0, "《欲望之镜》主长卷全景图"),
                    img_one(s, "p37", 1, "象征符号局部拼贴"),
                    img_one(s, "p38", 0, "欲望镜像局部章一：贪与痴"),
                    img_one(s, "p38", 1, "欲望镜像局部章二：惑与幻"),
                    img_one(s, "p38", 2, "微观凝视局部细节"),
                ],
            },
            {
                "id": "nf-virtual-symphony",
                "type": "subseries-group",
                "theme": "gallery",
                "title": "组作二：《虚拟交响》三维数字空间",
                "subtitle": "VIRTUAL SYMPHONY · 3D Digital Space",
                "year": "2024",
                "description": "以丰富视觉元素与大胆色彩重构三维数字空间，融合古典雕像、几何网格、超现实装置与未来科技界面，营造出在空间结构、时间叙事与感官体验上持续变幻的数字交响场域。",
                "tags": ["空间结构", "时间叙事", "感官体验", "技术美学"],
                "columns": 3,
                "images": imgs(s, "p39", captions=[
                    "《虚拟交响》视角 01", "《虚拟交响》空间全景", "《虚拟交响》视角 03",
                    "立体结构细节 04", "色彩秩序节点 05", "超现实建筑构件 06", "空间漫游截图 07",
                ]),
            },
            {
                "id": "nf-epilogue",
                "type": "process-steps",
                "theme": "mist",
                "heading": "项目后记：国家艺术基金培养脉络与数字孪生实践",
                "intro": "该项目深度融合文化艺术与信息技术资源，培养掌握数字艺术、数字多维空间及数字孪生技术的复合型人才，助力国家文化数字化战略实施与博物馆创新实践。",
                "steps": [
                    {"step": "2023", "title": "项目正式立项", "detail": "入选国家艺术基金年度人才培养资助项目。"},
                    {"step": "2024.01", "title": "全国招生启动", "detail": "由文旅部艺术发展中心统筹组织跨界艺术与技术人才选拔。"},
                    {"step": "2024.04", "title": "集中培训结业", "detail": "于中央美术学院等研修基地完成三维空间与数字孪生系统课程。"},
                    {"step": "2024.07", "title": "结业作品展开幕", "detail": "完成《欲望之镜》《虚拟交响》驻地作品并参展结业展览。"},
                ],
                "images": imgs(s, "p40", captions=["国家艺术基金《数字博物馆数字艺术人才培训》结业证书与展讯"]),
            },
        ],
    })

    # -------------------------------------------------------------------------
    # Ⅰ-08 数字艺术创作小辑 (2022—2025)
    # -------------------------------------------------------------------------
    s = "08-digital-art-anthology"
    projects.append({
        "slug": s,
        "no": "Ⅰ-08",
        "categoryId": "art",
        "categoryLabel": "Ⅰ 艺术创作",
        "title": "数字艺术创作小辑",
        "subtitle": "2022—2025 七组实验摄影、AI 摄影与动态图像系列精选",
        "year": "2022—2025",
        "medium": "实验摄影 / AI 摄影 / 动态图像",
        "durationOrSpec": "含今日美术馆红树林AI艺术展、费那奇动画周、UCCA 展映",
        "theme": "obsidian",
        "heroImage": img_one(s, "p41", 0, "《数字艺术创作小辑（2022—2025）》主视觉"),
        "summary": "收录任玄奇于 2022—2025 年间创作的七组碎片化实验摄影与动态影像系列——《梦境遗像》《进化的悖论》《恐龙大王》《视域孤岛》《失重牧歌》《燃羽之徒》与《父与子》，围绕图像如何超越既有美学与叙事、重塑技术与人性的诗意关系展开探索。",
        "tags": ["实验摄影", "AI 摄影", "今日美术馆", "费那奇动画周", "UCCA 尤伦斯", "图像文化研究"],
        "honors": [
            "红树林 AI 艺术展（今日美术馆 · 2025.01）",
            "费那奇动画周 超短 GIF 动画大赛（2025.08）",
            "UCCA 尤伦斯当代艺术中心“爱恨情仇”AI 影像创作计划（2024.06）",
        ],
        "meta": [
            {"label": "年份跨度", "value": "2022 — 2025"},
            {"label": "核心议题", "value": "图像文化研究 · 技术与人性 · 超现实寓言"},
            {"label": "收录子系列", "value": "7 组独立实验摄影与动态图像系列"},
            {"label": "代表展馆", "value": "今日美术馆 / UCCA 尤伦斯 / 费那奇动画周"},
        ],
        "blocks": [
            {
                "id": "da-question",
                "type": "quote-banner",
                "theme": "obsidian",
                "quote": "“图像如何超越既有的美学与叙事，生成新的视觉谱系？”",
                "attribution": "数字艺术创作小辑 (2022—2025)",
                "subtext": "既是对技术与媒介的交织实验，更是对图像文化与当代艺术表达的一次次开放性探寻。",
            },
            {
                "id": "da-dream-portraits",
                "type": "subseries-group",
                "theme": "gallery",
                "title": "01 / 《梦境遗像（梦境幻像）》实验摄影",
                "subtitle": "3072×3072 · 500dpi · 谁在编写我们的梦？",
                "year": "2023",
                "description": "围绕主体与机器不可分割的奇异纽带展开：白色机器的复古外观与被遮挡的人类面孔结合，在梦境与现实交织的边界处营造超现实氛围，质问科技面纱下人类梦境的真实面貌。",
                "tags": ["置换", "互联", "匿忆", "复古机械"],
                "columns": 4,
                "images": [
                    img_one(s, "p42", 0, "电视头人群超现实群像主视觉"),
                    *imgs(s, "p42", skip_files={"p42-01.webp"}),
                    *imgs(s, "p43")[:8],
                ],
            },
            {
                "id": "da-evolution",
                "type": "subseries-group",
                "theme": "parchment",
                "title": "02 / 《进化的悖论》实验摄影",
                "subtitle": "THE PARADOX OF EVOLUTION · 进化的回声与文化拟态",
                "year": "2025.01",
                "exhibition": "今日美术馆 · 红树林 AI 艺术展",
                "description": "作品以人兽拼接与身份遮蔽，探讨个体与群体、进化与文化的矛盾。戏谑的影像语言模糊真实与虚构，反思自我认知与现代性危机。",
                "tags": ["身份错位", "伪装行进", "文化拟态"],
                "columns": 3,
                "images": [
                    *imgs(s, "p45", captions=["进化的序列全景长图", "鸟首人物局部", "进化阶梯切片"]),
                    *imgs(s, "p44", captions=["鸟首拼接肖像研究"]),
                ],
            },
            {
                "id": "da-dinosaur",
                "type": "subseries-group",
                "theme": "gallery",
                "title": "03 / 《恐龙大王》实验摄影",
                "subtitle": "恐龙候车队列 · 候车室里的长颈兽 · 狂欢猩影",
                "description": "史前的远古巨兽与现代的城市秩序被强行拼贴在同一画面。恐龙不再只是童年幻想的化石，而成为“排队”的社会隐喻：个体在规训中趋同，生物在文化中被改造。",
                "tags": ["史前寓言", "荒诞日常秩序", "现代规训"],
                "columns": 3,
                "images": imgs(s, "p46", captions=["恐龙候车队列", "候车室里的长颈兽", "狂欢猩影"]),
            },
            {
                "id": "da-island",
                "type": "subseries-group",
                "theme": "mist",
                "title": "04 / 《视域孤岛》动态图像 & 05 / 《失重牧歌》实验摄影",
                "year": "2025.08",
                "exhibition": "费那奇动画周 · 超短 GIF 动画大赛",
                "description": "浮空的几何与羊群在超现实草地上失重悬浮——以简约诗意的构图回应日常观看习惯之外的孤独感与空间漂浮感。",
                "columns": 4,
                "images": [
                    *imgs(s, "p47", captions=["视域孤岛帧 01", "视域孤岛帧 02", "视域孤岛帧 03", "视域孤岛帧 04"]),
                    *imgs(s, "p48", captions=["失重牧歌 · 浮空绵羊主图", "失重牧歌 · 房间碎片", "失重牧歌 · 镜像构图"]),
                ],
            },
            {
                "id": "da-feather-father",
                "type": "subseries-group",
                "theme": "obsidian",
                "title": "06 / 《燃羽之徒》 & 07 / 《父与子》系列",
                "year": "2024—2025",
                "exhibition": "今日美术馆红树林 AI 展 (2025.01) / UCCA 尤伦斯 (2024.06)",
                "description": "《燃羽之徒》中烈焰巨鸟与低首前行的西装异客构成毁灭、掠夺与救赎的寓言；《父与子》入选 UCCA 尤伦斯当代艺术中心“爱恨情仇”AI 影像创作计划，以黑白影调凝视亲情与时代。",
                "columns": 3,
                "images": [
                    img_one(s, "p49", 0, "《燃羽之徒》火焰巨鸟主视觉"),
                    *imgs(s, "p50", captions=["《父与子》系列 · 海边剪影", "《父与子》系列 · 单车记忆", "《父与子》系列 · 家庭影像", "《父与子》系列 · 光影对话"]),
                ],
            },
        ],
    })

    # -------------------------------------------------------------------------
    # Ⅱ-01 《设计你的未来》交互影像装置
    # -------------------------------------------------------------------------
    s = "09-design-your-future"
    projects.append({
        "slug": s,
        "no": "Ⅱ-01",
        "categoryId": "research",
        "categoryLabel": "Ⅱ 科研课题项目",
        "title": "《设计你的未来》交互影像装置",
        "subtitle": "DESIGN YOUR FUTURE · 激光测距 × 视觉捕捉 × 即时热升华实体输出",
        "year": "2024",
        "medium": "传感交互影像装置 / 计算机视觉 / AIGC / 热升华打印",
        "durationOrSpec": "触发—感知—捕捉—合成—输出 完整产品闭环 · 天美美术馆展出",
        "theme": "obsidian",
        "heroImage": img_one(s, "p58", 0, "2024.05 天美美术馆《设计你的未来》交互装置展览现场"),
        "summary": "一款集激光测距传感、计算机视觉捕捉、AI 实时生成与热升华实体输出于一体的交互影像装置。当观众步入展区，距离变化触发算法围绕“设”“计”轮廓生成独特视觉元素，融合观者实时人像后即刻打印交付独一无二的纸质艺术纪念品。",
        "tags": ["激光测距", "视觉捕捉", "人机协同", "热升华输出", "可控图像合成", "产品化落地"],
        "honors": [
            "2024.05 展出天美美术馆，展览期间多次引发排队参与与社交分享热潮",
        ],
        "meta": [
            {"label": "年份", "value": "2024.05"},
            {"label": "技术闭环", "value": "激光测距 → 视觉捕捉 → 算法合成 → 热升华打印"},
            {"label": "展陈地点", "value": "天津美术学院美术馆"},
            {"label": "课题类别", "value": "集成式交互应用与产品化落地"},
        ],
        "blocks": [
            {
                "id": "dyf-intro",
                "type": "editorial-split",
                "theme": "obsidian",
                "layout": "image-left",
                "eyebrow": "01 / 装置理念 · 人脑预判与 AI 偶然性",
                "heading": "一场关于未来的文化预演",
                "paragraphs": [
                    "装置如同一位敏锐的观察者，通过传感器与镜头映照您的存在与动态：AI 以算法为笔，将观者的身影绘入“设计”的无限演化之中，最终凝结为一幅实体的纸质纪念作品。",
                    "在预设审美结构中引入算法偶然性，探讨未来设计中“确定性预期”与“不可知随机性”之间的张力，构建了一套完整可用的技术产品化闭环。",
                ],
                "images": [
                    img_one(s, "p53", 0, "《设计』主题六十余幅可控生成元阵列"),
                    img_one(s, "p54", 0, "交互影像装置软硬件结构总览"),
                ],
            },
            {
                "id": "dyf-workflow",
                "type": "process-steps",
                "theme": "gallery",
                "heading": "端到端互动流程：触发 · 感知 · 捕捉 · 合成 · 输出",
                "intro": "观者的实时空间位移驱动整套多模态闭环系统，完成从动态交互体验至物理实体作品的即时转化。",
                "steps": [
                    {"step": "01 — 触发 TRIGGER", "title": "入场距离感应", "detail": "激光测距模块实时感知观众步入展区，自动激活互动会话并匹配动态视觉反馈。"},
                    {"step": "02 — 感知 PERCEPTION", "title": "趋近调控节奏", "detail": "观众越靠近屏幕，画面粒子与生成结构越发灵动，以身体位移直接干预算法参数。"},
                    {"step": "03 — 捕捉 CAPTURE", "title": "计算机视觉定格", "detail": "摄像头捕捉最佳瞬间、提取观者姿态轮廓与面部特征，同时生成“设”“计”随机元素。"},
                    {"step": "04 — 合成 & 输出", "title": "热升华实体交付", "detail": "智能融合观者影像与生成元画面，通过高清热升华打印机现场即时输出专属艺术卡片。"},
                ],
                "images": imgs(s, "p55")[:5],
            },
            {
                "id": "dyf-generators",
                "type": "gallery-grid",
                "theme": "obsidian",
                "heading": "基于「设」「计」汉字轮廓的可控生成元与现场展陈",
                "description": "1. 技术基底（空间约束）→ 2. 结构化汉字转译引导 → 3. 确定性与偶然性共存输出。以下展示“设”“计”高分辨率生成元矩阵与 2024.05 天美美术馆观众排队体验实景。",
                "columns": 3,
                "ratio": "auto",
                "items": [
                    img_one(s, "p57", 0, "“设”“计”字形生成元总览"),
                    *imgs(s, "p57")[1:12],
                    img_one(s, "p59", 0, "天美美术馆现场观展全景"),
                    img_one(s, "p59", 1, "观众扫码取走热升华实体打印作品"),
                    img_one(s, "p59", 2, "现场观众排队参与热潮"),
                ],
            },
        ],
    })

    # -------------------------------------------------------------------------
    # Ⅱ-02 杨柳青木版年画非遗数字化焕新
    # -------------------------------------------------------------------------
    s = "10-yangliuqing-aigc"
    p62_samples = imgs(s, "p62", skip_files={"p62-33.webp"})
    for idx, im in enumerate(p62_samples):
        im["code"] = f"YLQ-{idx+1:02d}"
        im["caption"] = f"精选采样样本 #{idx+1:02d}"

    projects.append({
        "slug": s,
        "no": "Ⅱ-02",
        "categoryId": "research",
        "categoryLabel": "Ⅱ 科研课题项目",
        "title": "杨柳青木版年画非遗数字化焕新",
        "subtitle": "核心恒定 · 边缘创新 — 人工智能图像生成技术与非遗活态传承",
        "year": "2024—2025",
        "medium": "定制模型训练 / 视觉参数化 / 风格迁移",
        "durationOrSpec": "60+ 经典年画解析 · 第二届新媒体与非遗学术论坛报告",
        "theme": "parchment",
        "heroImage": img_one(s, "p68", 0, "AI 生成杨柳青风格年画全景矩阵"),
        "summary": "以天津杨柳青木版年画为研究载体，构建“视觉解析—风格学习—创新生成”设计方法论，确立“核心恒定—边缘创新”策略。通过对 60 余幅经典年画进行造型、色彩与装饰参数化解构并训练定制模型，系统形成传承性、融合性与实验性三层创新设计，成果发表于中央民族大学第二届新媒体与非物质文化遗产学术论坛。",
        "tags": ["非遗数字化", "杨柳青年画", "核心恒定边缘创新", "定制模型", "风格迁移"],
        "honors": [
            "论文发表并宣读：第二届新媒体与非物质文化遗产学术论坛（中央民族大学，2025）",
            "入选中国文化旅游产业博览会 · 天津新杨柳青创新研究项目",
        ],
        "meta": [
            {"label": "年份", "value": "2024 — 2025"},
            {"label": "核心策略", "value": "视觉解析 · 风格学习 · 创新生成"},
            {"label": "设计原则", "value": "核心恒定（文化基因） — 边缘可变（当代转译）"},
            {"label": "学术发表", "value": "中央民族大学 · 第二届新媒体与非遗论坛"},
        ],
        "blocks": [
            {
                "id": "ylq-method",
                "type": "process-steps",
                "theme": "parchment",
                "heading": "三重研究框架与《连年有余》传统视觉解构",
                "intro": "在数字化浪潮下，非但要忠实再现年画吉祥寓意与线描敷彩章法，更要以智能工具打通当代审美对话。",
                "steps": [
                    {"step": "① AIGC 技术赋能", "title": "传统风格深度学习与重构", "detail": "精选高清样本数据集与标签标注，构建专属风格化训练权重，稳定提取木版套印质感与人物神态。"},
                    {"step": "② 视觉语言解析", "title": "造型 · 色彩 · 装饰参数化", "detail": "系统拆解杨柳青年画开相比例、双髻服饰纹样与吉祥符号（如鱼、莲、童子），建立数字化转译机制。"},
                    {"step": "③ 传承创新融合", "title": "“核心恒定—边缘可变”策略", "detail": "在核心文化符号恒定的前提下，衍生传承性复刻、卡通融合性与先锋实验性三个递进创新层次。"},
                ],
                "images": [
                    img_one(s, "p61", 0, "传统母本参照：杨柳青年画《连年有余》"),
                    img_one(s, "p62", 32, "数据集采集、特征提取与模型训练完整技术流程图"),
                ],
            },
            {
                "id": "ylq-samples",
                "type": "gallery-grid",
                "theme": "gallery",
                "heading": "阶段一：32 幅精选原始数据集与特征标注",
                "description": "从样本采集、特征提取到数据标注的完整数据集构建过程。",
                "columns": 6,
                "ratio": "landscape",
                "items": p62_samples[:24],
            },
            {
                "id": "ylq-params",
                "type": "comparison-pair",
                "theme": "parchment",
                "heading": "阶段二：模型权重梯度与结构控制参数对照实验",
                "description": "保持大模型、采样器（DPM++ 2M Karras, 步数 20, CFG 7）与姿态约束不变，对比权重 0.7 与 0.8 及边缘线稿引导强度对服饰纹理与人物气韵的影响。",
                "pairs": [
                    {
                        "title": "实验组 A · 融合保留配置",
                        "subtitle": "风格权重 0.7 · 姿态 0.7 / 边缘 0.2",
                        "image": img_one(s, "p63", 0, "风格权重 0.7 生成效果（服饰细节与柔美构图）"),
                        "specs": [
                            "正向关键词: yangliuqing, solo, simple background, double hair bun, chinese clothes",
                            "反向约束: EasyNegativeV2, badhandv4",
                            "采样与控制: DPM++ 2M Karras · Steps 20 · CFG 7 · Pose 0.7 + Scribble 0.2",
                        ],
                        "caption": "权重 0.7 时在传统服饰纹样与当代人物比例间保持较强柔和过渡。",
                    },
                    {
                        "title": "实验组 B · 高保真经典重构",
                        "subtitle": "风格权重 0.8 · 姿态 0.7 / 边缘 0.4",
                        "image": img_one(s, "p63", 1, "风格权重 0.8 生成效果（传统年画构图与敷彩还原度显著提升）"),
                        "specs": [
                            "正向关键词: yangliuqing, solo, simple background, double hair bun, chinese clothes",
                            "反向约束: EasyNegativeV2:1.2, badhandv4:1.2",
                            "采样与控制: DPM++ 2M Karras · Steps 20 · CFG 7 · Pose 0.7 + Scribble 0.4",
                        ],
                        "caption": "提升权重至 0.8 并加强线稿引导后，发髻开相与民间画风忠实度明显增强。",
                    },
                ],
            },
            {
                "id": "ylq-generations",
                "type": "subseries-group",
                "theme": "gallery",
                "title": "创新生成成果：B 系列早期复刻 × C/D 系列卡通融合实验",
                "subtitle": "提示语工程 × 多模态视觉参数化（B01—B05 / C01—C12 / D01—D06）",
                "description": "既忠实再现吉祥寓意、传统发髻与敷彩层次，又与现代卡通潮流造型混合生成年轻化文创新表达。",
                "columns": 4,
                "images": [
                    *imgs(s, "p64", codes=["B01", "B02", "B03", "B04", "B05"]),
                    *imgs(s, "p65", codes=[f"C{i:02d}" for i in range(1, 13)]),
                    *imgs(s, "p66", codes=[f"D{i:02d}" for i in range(1, 7)]),
                ],
            },
            {
                "id": "ylq-mockup",
                "type": "full-figure",
                "theme": "parchment",
                "heading": "应用落地：文创样机演绎与全景年画集群",
                "caption": "以沉浸式文创样机展示传统符码与当代生活美学融合，激活非遗活态生命力。",
                "aspect": "contain",
                "image": img_one(s, "p67", 0, "AI 生成杨柳青风格文创产品样机展示"),
            },
            {
                "id": "ylq-forum",
                "type": "exhibition-wall",
                "theme": "gallery",
                "heading": "学术论坛汇报：第二届新媒体与非物质文化遗产学术论坛",
                "description": "研究论文与实践成果在中央民族大学第二届新媒体与非物质文化遗产学术论坛汇报，提出可操作的技术赋能文化“两创”设计战略体系。",
                "records": [
                    {"title": "第二届新媒体与非物质文化遗产学术论坛 主题宣读", "date": "2025", "organizer": "中央民族大学", "venue": "北京"},
                ],
                "images": imgs(s, "p69", captions=["第二届新媒体与非物质文化遗产学术论坛大会现场", "分论坛学术发言与圆桌讨论现场"]),
            },
        ],
    })

    # -------------------------------------------------------------------------
    # Ⅱ-03 《红楼梦》中华美学当代艺术转化
    # -------------------------------------------------------------------------
    s = "11-red-chamber-aesthetics"
    projects.append({
        "slug": s,
        "no": "Ⅱ-03",
        "categoryId": "research",
        "categoryLabel": "Ⅱ 科研课题项目",
        "title": "《红楼梦》中华美学当代艺术转化",
        "subtitle": "生成式人工智能语境下的跨文化图像再生产研究",
        "year": "2025",
        "medium": "AIGC / 定制风格模型 / 跨文化图像再生产",
        "durationOrSpec": "清·孙温绘本基底 × 西方古典绘画构图互映 · 北京曹雪芹学会展",
        "theme": "parchment",
        "heroImage": img_one(s, "p70", 1, "“当 AI 遇上红楼梦”AIGC 中华美学展海报"),
        "summary": "以清代画家孙温《红楼梦》绘本为基底炼制专属工笔重彩风格模型，提炼其笔触气韵与叙事章法；再结合空间轮廓迁移技术，将《雅典学院》《自由引导人民》等西方经典绘画的形象语汇移植进大观园叙事场景，探讨全球化语境中中华美学如何与他者互映。",
        "tags": ["孙温绘本", "红楼梦", "中华美学", "跨文化对话", "图像再生产", "著书西山"],
        "honors": [
            "参展 AIGC 中华美学展（北京曹雪芹学会 · 北京市西山国家森林公园文化展示馆）",
        ],
        "meta": [
            {"label": "年份", "value": "2024—2025"},
            {"label": "文献母本", "value": "清·孙温绘本《红楼梦》（精毓风雅 / 仙葩美玉 / 风月宝鉴）"},
            {"label": "跨文化参照", "value": "拉斐尔《雅典学院》 / 德拉克洛瓦《自由引导人民》"},
            {"label": "展览机构", "value": "北京曹雪芹学会 · AIGC 中华美学展"},
        ],
        "blocks": [
            {
                "id": "rc-overview",
                "type": "editorial-split",
                "theme": "parchment",
                "layout": "image-right",
                "eyebrow": "01 / 跨文化图像再生产 · 东方与西方",
                "heading": "当孙温工笔气韵遇上西方古典群像构图",
                "paragraphs": [
                    "本作品以清代画家孙温《红楼梦》绘本为基底，通过定制风格模型提炼其设色清雅、工细传神的笔墨韵致与园林建筑语汇；同时借由空间语义迁移，将西方美术史上经典的群体戏剧构图移植进红楼叙事空间。",
                    "展览以《精毓风雅》《仙葩美玉》《风月宝鉴》《著书西山》四个维度展开，在生成式人工智能的媒介实验室里构建出东西方美学深度对话的当代视觉场域。",
                ],
                "images": [
                    img_one(s, "p70", 0, "《红楼梦·大观园全景》生成创作手卷"),
                ],
            },
            {
                "id": "rc-pairs",
                "type": "comparison-pair",
                "theme": "gallery",
                "heading": "代表转译对照：孙温绘本 ×《雅典学院》/《自由引导人民》",
                "description": "保留红楼人物仪态、服饰与园林亭台秩序的同时，承接文艺复兴透视集聚力与浪漫主义群体张力。",
                "pairs": [
                    {
                        "title": "对照系列 A · 孙温绘本 × 拉斐尔《雅典学院》",
                        "subtitle": "古典理性空间与大观园儒雅聚会",
                        "image": img_one(s, "p71", 0, "《雅典学院》构图转译实验"),
                        "caption": "大观园众人依古典中心透视聚会，既见孙温笔意，亦含古典学院派构图节奏。",
                    },
                    {
                        "title": "对照系列 B · 第 55–56 回 ×《自由引导人民》",
                        "subtitle": "欺幼主刁奴蓄险心 · 敏探春兴利除宿弊",
                        "image": img_one(s, "p71", 2, "《自由引导人民》构图转译实验"),
                        "caption": "以戏剧化的斜向金字塔构图转译第五十五回叙事张力，重构东西互映的当代视觉经验。",
                    },
                    {
                        "title": "细节衍生 · 风月宝鉴系列生成变体 ①",
                        "image": img_one(s, "p71", 1, "《雅典学院》风格迁移对比帧"),
                    },
                    {
                        "title": "细节衍生 · 风月宝鉴系列生成变体 ②",
                        "image": img_one(s, "p71", 4, "《红楼梦》跨文化场景局部细化"),
                    },
                ],
            },
        ],
    })

    # -------------------------------------------------------------------------
    # Ⅲ-01 中国科学技术馆 · 音乐会音乐可视化
    # -------------------------------------------------------------------------
    s = "12-china-science-museum"
    projects.append({
        "slug": s,
        "no": "Ⅲ-01",
        "categoryId": "commercial",
        "categoryLabel": "Ⅲ 商业项目",
        "title": "中国科学技术馆 · 音乐会音乐可视化",
        "subtitle": "“AI 赋能未来 · 未来媒介”创客营音乐会实时视觉工程",
        "year": "2025",
        "medium": "音乐可视化 / 沉浸影像 / 声学共振视觉",
        "durationOrSpec": "中国科学技术馆 · 中国科学技术大学合作活动",
        "theme": "gallery",
        "heroImage": img_one(s, "p75", 0, "《光影涌动》冷蓝调抽象声画视效 F01"),
        "summary": "为中国科学技术馆“AI 赋能未来 · 未来媒介”创客营闭幕音乐会打造的沉浸式音乐可视化视觉系统。以深邃冷蓝与鎏金光影为基调，通过虚拟波谱驱动抽象流形与音律实时共振，在场馆大屏营造科学与艺术交织的未来幻境。",
        "tags": ["中国科技馆", "音乐可视化", "声画共振", "冷蓝调诗性", "公共科普场馆"],
        "meta": [
            {"label": "合作机构", "value": "中国科学技术馆 · 中国科学技术大学"},
            {"label": "项目年份", "value": "2025"},
            {"label": "视觉母题", "value": "光影涌动 / 蓝色诗性 / 宇宙共振 / 虚拟波谱"},
        ],
        "blocks": [
            {
                "id": "csm-context",
                "type": "editorial-split",
                "theme": "gallery",
                "layout": "image-right",
                "eyebrow": "01 / 项目背景 · AI 赋能未来媒介",
                "heading": "将科学传播、声学音律与抽象美学融为一屏",
                "paragraphs": [
                    "在中国科学技术馆与中国科学技术大学联合举办的“AI 赋能未来 · 未来媒介”创客营活动中，专家学者与创作者围绕 AIGC 在科学传播、艺术创意及教育普及等领域的实践展开前沿探索。",
                    "本可视化项目作为大会音乐会的核心舞台背景视效，将声学频谱实时转译为高分辨率流体线条与抽象光影粒子，完成了多曲目场馆大屏现场联调与演出交付。",
                ],
                "images": [img_one(s, "p74", 0, "音乐会视觉主构成：光影涌动与几何声场")],
            },
            {
                "id": "csm-stills",
                "type": "gallery-grid",
                "theme": "obsidian",
                "heading": "舞台视觉序列：光影涌动 · 虚拟波谱 F01—F04",
                "columns": 3,
                "ratio": "landscape",
                "items": [
                    *imgs(s, "p75", codes=["F01", "F02", "LIVE"], captions=["光影涌动 F01", "蓝色诗性 F02", "宇宙共振 · 多色阶音律变奏"]),
                    *imgs(s, "p76", codes=["S01", "F03", "F04", "WAVE"], captions=["晶体波纹质感", "虚拟波谱 F03 · 高密度线阵", "暗场声浪 F04", "深海频谱能量场"]),
                ],
            },
        ],
    })

    # -------------------------------------------------------------------------
    # Ⅲ-02 天津市科技美术设计大赛 · 宣传片
    # -------------------------------------------------------------------------
    s = "13-tianjin-sci-art-contest"
    projects.append({
        "slug": s,
        "no": "Ⅲ-02",
        "categoryId": "commercial",
        "categoryLabel": "Ⅲ 商业项目",
        "title": "天津市科技美术设计大赛 · 宣传片",
        "subtitle": "交点 · 裸眼 3D 开幕式视觉工程与赛事宣传影像",
        "year": "2025",
        "medium": "宣传影像 / 裸眼 3D / 三维动态视觉",
        "durationOrSpec": "天津市大学生科技美术设计大赛官方开幕式及全网宣传片",
        "theme": "cerulean",
        "heroImage": img_one(s, "p77", 0, "《交点》天津市科技美术设计大赛官方主视觉海报"),
        "summary": "担任天津市大学生科技美术设计大赛开幕式裸眼 3D 宣传片视觉制作与技术美术支持，以《交点》为视觉主题，通过未来感空间结构与动态光影展现科技、设计与美术在高校青年群体中的跨学科融合能量。",
        "tags": ["裸眼 3D", "科技美术融合", "高校创新设计", "学术论坛展演", "产业与社会服务"],
        "meta": [
            {"label": "项目年份", "value": "2025"},
            {"label": "核心形式", "value": "裸眼 3D 开幕式大屏影像 + 主视觉海报体系"},
            {"label": "赛事主题", "value": "交点 · 科技与美术的跨界对话"},
        ],
        "blocks": [
            {
                "id": "tj-main",
                "type": "editorial-split",
                "theme": "gallery",
                "layout": "image-left",
                "eyebrow": "01 / 赛事视觉传播 · 裸眼 3D 开幕式",
                "heading": "科技与美术交汇的公共空间数字视觉表达",
                "paragraphs": [
                    "围绕“科技美术融合 / 高校创新设计 / 跨学科交流 / 产业与社会服务 / 学术论坛与展演”五大核心维度，本片通过精准的视锥透视校准与高对比三维动态图形，呈现大赛的视觉精神与创意能量。",
                    "宣传片同步服务于学术论坛与优秀作品巡展，搭建多所高校师生在技术美术与智能设计领域深度交流的公共视觉平台。",
                ],
                "images": [img_one(s, "p77", 0, "《交点》主视觉与三维动效结构海报")],
            },
        ],
    })

    # -------------------------------------------------------------------------
    # Ⅲ-03 天津美术学院 2024 毕业季《生如夏花》
    # -------------------------------------------------------------------------
    s = "14-tafa-2024-graduation"
    projects.append({
        "slug": s,
        "no": "Ⅲ-03",
        "categoryId": "commercial",
        "categoryLabel": "Ⅲ 商业项目",
        "title": "天津美术学院 2024 毕业季《生如夏花》",
        "subtitle": "青春影像诗 · 三维建模与 ComfyUI 多艺术风格逐帧转绘宣传片",
        "year": "2024",
        "medium": "三维建模 / 动画制作 / 多模态工作流逐帧风格化渲染",
        "durationOrSpec": "油画质感 · 数字插画 · 国画没骨花鸟 三重风格转译",
        "theme": "cerulean",
        "heroImage": img_one(s, "p78", 0, "《生如夏花》蓝金繁花三维绽放主视觉"),
        "summary": "为天津美术学院 2024 毕业季创作的官方宣传片《生如夏花》。以三维场景建模与动画为骨架，结合 ComfyUI 多通道工作流实现逐帧风格化渲染，使同一段毕业青春影像丝滑跨越油画厚涂、现代数字插画与国画没骨花鸟三种传统与当代绘画语境。",
        "tags": ["生如夏花", "三维建模", "ComfyUI 工作流", "逐帧风格化", "国画没骨花鸟", "油画质感"],
        "meta": [
            {"label": "年份", "value": "2024"},
            {"label": "委托机构", "value": "天津美术学院 · 2024 毕业季"},
            {"label": "核心工艺", "value": "Blender 三维动画 + 多通道 ComfyUI 逐帧风格转绘"},
            {"label": "风格光谱", "value": "油画 / 数字艺术 / 卡通插画 / 国画没骨花鸟"},
        ],
        "blocks": [
            {
                "id": "txh-process",
                "type": "editorial-split",
                "theme": "cerulean",
                "layout": "image-right",
                "eyebrow": "01 / 青春影像诗 · 艺术跨界",
                "heading": "让数字与传统绘画语汇在同一时间轴上呼吸",
                "paragraphs": [
                    "本片采用三维建模与动画制作搭建稳定可控的镜头运动与光影关系，再结合 ComfyUI 流程与空间轮廓控制实现逐帧风格化渲染。",
                    "从厚重典雅的油画笔触，到清新锐利的数字插画，再到淡雅润泽的中国画没骨花鸟，每一帧都在数字计算与东方美学的交汇中精雕细琢，呈现天美毕业季独有的视觉诗意与青春张力。",
                ],
                "images": imgs(s, "p80", codes=["G01", "G02"], captions=["G01 繁花绽放动态序列", "G02 天美校徽三维透雕结晶帧"]),
            },
            {
                "id": "txh-styles",
                "type": "gallery-grid",
                "theme": "gallery",
                "heading": "多风格逐帧转译对照 & 没骨花鸟横卷",
                "columns": 2,
                "ratio": "landscape",
                "items": [
                    *imgs(s, "p79", captions=["画架林间 · 印象派油画变体", "林间光影 · 水粉笔触测试", "高饱和写意氛围转绘", "水墨灰度结构控制测试"]),
                    img_one(s, "p81", 0, "《生如夏花》2024 毕业季三联竖版风格主海报（水彩 / 雕塑 / 工笔花鸟）"),
                    img_one(s, "p81", 1, "花鸟水墨长卷局部纹理"),
                ],
            },
        ],
    })

    # -------------------------------------------------------------------------
    # Ⅲ-04 中国日报社 ·《马远的意境诗篇》
    # -------------------------------------------------------------------------
    s = "15-china-daily-ma-yuan"
    projects.append({
        "slug": s,
        "no": "Ⅲ-04",
        "categoryId": "commercial",
        "categoryLabel": "Ⅲ 商业项目",
        "title": "中国日报社 ·《马远的意境诗篇》",
        "subtitle": "以南宋马远《水图》为蓝本训练定制水墨模型与三维动态山水",
        "year": "2024",
        "medium": "AI 动画 / 定制水墨模型训练 / 三维空间表现",
        "durationOrSpec": "层波叠浪 · 黄河逆流 · 长江万顷 · 晓日烘山（中国日报发布）",
        "theme": "parchment",
        "heroImage": img_one(s, "p82", 0, "南宋马远《水图·层波叠浪》原卷母本"),
        "summary": "为中国日报社制作的文化传播项目《马远的意境诗篇》。作品以南宋大画家马远传世名作《水图》十二卷为数据集训练专属定制模型，将“层波叠浪、黄河逆流、长江万顷、晓日烘山”的千年笔墨神韵转化为三维立体、可自由流动的动态山水诗篇。",
        "tags": ["中国日报社", "马远水图", "定制水墨模型", "动态山水意境", "中华美学数字化"],
        "meta": [
            {"label": "年份", "value": "2024"},
            {"label": "出品发布", "value": "中国日报社"},
            {"label": "古典母本", "value": "南宋 · 马远《水图》（层波叠浪 / 黄河逆流 / 长江万顷 / 晓日烘山）"},
        ],
        "blocks": [
            {
                "id": "my-overview",
                "type": "editorial-split",
                "theme": "parchment",
                "layout": "image-right",
                "eyebrow": "01 / 定制模型炼制 · AI 重塑古典水墨",
                "heading": "在保持千年笔墨神韵的同时赋予三维空间生命",
                "paragraphs": [
                    "作品以故宫博物院藏马远《水图》为蓝本，提取宋代院体画“一角半边”的构图张力与“写水万状”的线条韵律，训练开发高精度水墨视觉定制模型。",
                    "成品通过三维摄影机运动与层次分离重绘，让静卧绢本之上的波澜云烟真正流动起来，向全球受众展现中国古典山水画的灵动神韵。",
                ],
                "images": [
                    img_one(s, "p82", 1, "《马远的意境诗篇》动态化还原成品截图"),
                    img_one(s, "p82", 2, "中国日报视觉官方平台公开发布记录"),
                ],
            },
            {
                "id": "my-scrolls",
                "type": "gallery-grid",
                "theme": "parchment",
                "heading": "《水图》四景动态演绎全记录",
                "description": "对应原画经典卷目：层波叠浪、黄河逆流、长江万顷与晓日烘山的高保真意境提取与动态插画生成。",
                "columns": 2,
                "ratio": "landscape",
                "items": [
                    img_one(s, "p83", 0, "《水图》动态演绎 · 层波叠浪"),
                    img_one(s, "p83", 1, "《水图》动态演绎 · 黄河逆流"),
                    img_one(s, "p83", 3, "《水图》动态演绎 · 长江万顷"),
                    img_one(s, "p83", 4, "《水图》动态演绎 · 晓日烘山"),
                ],
            },
        ],
    })

    # -------------------------------------------------------------------------
    # Ⅲ-05 上海嘉定文旅 ·《嘉定奇旅》
    # -------------------------------------------------------------------------
    s = "16-jiading-wonder-trip"
    projects.append({
        "slug": s,
        "no": "Ⅲ-05",
        "categoryId": "commercial",
        "categoryLabel": "Ⅲ 商业项目",
        "title": "上海嘉定文旅 ·《嘉定奇旅》",
        "subtitle": "Deforum 瞬息穿越、光影轮廓转绘与城市文化空间叙事",
        "year": "2025",
        "medium": "AI 动画 / 光影轮廓控制 / 多层次数字特效合成",
        "durationOrSpec": "上海嘉定历史底蕴与当代文旅风貌奇幻影像",
        "theme": "mist",
        "heroImage": img_one(s, "p84", 0, "《嘉定奇旅》主视觉海报与城市水墨地标"),
        "summary": "为上海嘉定文旅打造的创意宣传实验影像《嘉定奇旅》。以上海嘉定历史文化地标与现代城市风貌为创作蓝本，综合 Deforum 连续镜头运动控制、多层风貌风格转绘及拼贴合成管线，串联法华塔、嘉定新城与江南水乡意象。",
        "tags": ["上海嘉定文旅", "城市文化新貌", "风格转绘", "Deforum 瞬息穿梭", "沉浸体验"],
        "meta": [
            {"label": "年份", "value": "2025"},
            {"label": "出品方", "value": "上海嘉定文旅"},
            {"label": "视觉特征", "value": "历史与当代对话 · 长镜头瞬息空间转换"},
        ],
        "blocks": [
            {
                "id": "jd-gallery",
                "type": "editorial-split",
                "theme": "mist",
                "layout": "image-left",
                "eyebrow": "01 / 历史与当代对话 · 空间叙事",
                "heading": "从江南古镇水韵到赛博光影奇旅",
                "paragraphs": [
                    "本片以上海嘉定为创作蓝本，综合三维空间运动控制、光影轮廓引导与风格转绘技术，融合拼贴动态分层合成管线，构建出多层次、沉浸式的城市奇幻叙事空间。",
                    "镜头在古典园林青瓦、水乡帆影与未来流光溢彩的城市天际线间无缝穿行，呈现嘉定既厚重温润又充满创造力的双面性格。",
                ],
                "images": imgs(s, "p84", captions=["《嘉定奇旅》开篇主题视觉", "古典航船与拼贴时空穿越转场"]),
            },
            {
                "id": "jd-frames",
                "type": "gallery-grid",
                "theme": "gallery",
                "heading": "关键镜头：风格转绘 × Deforum 空间变幻",
                "columns": 2,
                "ratio": "landscape",
                "items": imgs(s, "p85", captions=["嘉定古镇夜景风格转绘静帧", "Deforum 瞬息穿梭建筑浮空场景"]),
            },
        ],
    })

    # -------------------------------------------------------------------------
    # Ⅲ-06 快手磁力引擎 2025 宣传片
    # -------------------------------------------------------------------------
    s = "17-kuaishou-2025"
    projects.append({
        "slug": s,
        "no": "Ⅲ-06",
        "categoryId": "commercial",
        "categoryLabel": "Ⅲ 商业项目",
        "title": "快手磁力引擎 2025 宣传片",
        "subtitle": "AI 驱动视觉革新 · 动态拼贴与连续视频商业影像",
        "year": "2025",
        "medium": "商业宣传影像 / AI 图像拼贴 / 连续动态视频",
        "durationOrSpec": "平台级节日视觉盛典 · 静帧与动态融合",
        "theme": "mist",
        "heroImage": img_one(s, "p86", 0, "快手磁力引擎 2025 宣传片三维微缩拼贴场景"),
        "summary": "为快手磁力引擎 2025 年度活动制作的品牌宣传影像。以 AI 生成视觉拼贴与连续动态视频融合为核心，打破传统商业短片的实拍与特效边界，用微缩玩具质感与高饱和度视觉叙事展现平台级节日狂欢活力。",
        "tags": ["快手磁力引擎", "AI 图像拼贴", "连续动态视频", "智能视觉叙事", "品牌传播"],
        "meta": [
            {"label": "年份", "value": "2025"},
            {"label": "品牌委托", "value": "快手 · 磁力引擎"},
            {"label": "核心技术", "value": "AI 生成图像拼贴 + 连续动态视频工作流"},
        ],
        "blocks": [
            {
                "id": "ks-main",
                "type": "editorial-split",
                "theme": "gallery",
                "layout": "image-right",
                "eyebrow": "01 / 智能视觉叙事 · 动态拼贴未来影像",
                "heading": "融合静态材质肌理与高能连续动态镜头",
                "paragraphs": [
                    "在传统商业宣传影像中，手工积木拼贴与超现实连续运动往往意味着高昂的实拍置景周期。本项目通过定制 AI 生成图像拼贴与连续动态视频生成技术，打通静帧质感控制与动态运镜衔接。",
                    "色彩明快的积木赛道、潮流滑板街区与跃动人物共同构建了充满节奏感与节日欢腾氛围的品牌视觉盛典。",
                ],
                "images": [
                    img_one(s, "p86", 0, "微缩积木赛道奔跑三维质感帧"),
                    img_one(s, "p87", 0, "潮流滑板与色彩涂鸦拼贴序列帧"),
                    img_one(s, "p87", 1, "动态跳跃主体姿态融合帧"),
                ],
            },
        ],
    })

    return projects


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob("*.json"):
        old.unlink()

    projects = build_all()
    assert len(projects) == 17, f"Expected 17 projects, got {len(projects)}"

    for proj in projects:
        fp = OUT_DIR / f"{proj['slug']}.json"
        fp.write_text(json.dumps(proj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Wrote {fp.name:34s} | theme={proj['theme']:9s} | blocks={len(proj['blocks'])}")


if __name__ == "__main__":
    main()
