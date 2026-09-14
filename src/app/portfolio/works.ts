// 占位作品数据：正式内容（标题、年份、媒介、介绍、预览素材）确认后替换此文件即可
export type Work = {
  id: string;
  title: string;
  year: string;
  medium: string;
  description: string;
  /** 占位贴图主色相（0-360），正式预览图确定后由图片取代 */
  hue: number;
};

export const works: Work[] = [
  {
    id: "work-01",
    title: "占位作品 01",
    year: "2026",
    medium: "影像 / 新媒体",
    description:
      "作品介绍占位：创作背景、使用媒介、展览与放映记录将在这里呈现。正式文案与预览素材确认后替换。",
    hue: 265,
  },
  {
    id: "work-02",
    title: "占位作品 02",
    year: "2025",
    medium: "交互装置",
    description:
      "作品介绍占位：创作背景、使用媒介、展览与放映记录将在这里呈现。正式文案与预览素材确认后替换。",
    hue: 160,
  },
  {
    id: "work-03",
    title: "占位作品 03",
    year: "2025",
    medium: "实验影像",
    description:
      "作品介绍占位：创作背景、使用媒介、展览与放映记录将在这里呈现。正式文案与预览素材确认后替换。",
    hue: 205,
  },
  {
    id: "work-04",
    title: "占位作品 04",
    year: "2024",
    medium: "数字绘画 / 生成艺术",
    description:
      "作品介绍占位：创作背景、使用媒介、展览与放映记录将在这里呈现。正式文案与预览素材确认后替换。",
    hue: 20,
  },
  {
    id: "work-05",
    title: "占位作品 05",
    year: "2024",
    medium: "影视 / 动画",
    description:
      "作品介绍占位：创作背景、使用媒介、展览与放映记录将在这里呈现。正式文案与预览素材确认后替换。",
    hue: 320,
  },
  {
    id: "work-06",
    title: "占位作品 06",
    year: "2023",
    medium: "声音 / 视听",
    description:
      "作品介绍占位：创作背景、使用媒介、展览与放映记录将在这里呈现。正式文案与预览素材确认后替换。",
    hue: 110,
  },
];
