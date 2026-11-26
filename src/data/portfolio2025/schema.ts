export type PaletteTheme = "gallery" | "obsidian" | "parchment" | "cerulean" | "mist";

export type CategoryId = "art" | "research" | "commercial";

export type MediaItem = {
  src: string;
  alt: string;
  caption?: string;
  code?: string;
  width?: number;
  height?: number;
};

export type FolioImageLayer = {
  id: string;
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  kind: "single" | "continuous-group";
  tileCount?: number;
  alt: string;
  caption?: string;
};

export type FolioTextLayer = {
  id: string;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  fontSizePt: number;
  lineHeight: number;
  color: string;
  fontFamily: "sans" | "serif" | "mono";
  fontWeight: number;
  align: "left" | "center" | "right";
  rotation?: 0 | 90 | -90;
  letterSpacingEm?: number;
  singleLine?: boolean;
  anchorRight?: boolean;
  rightPct?: number;
  textIndentEm?: number;
};

export type FolioPage = {
  id: string;
  pageNo: number;
  label?: string;
  widthPt: number;
  heightPt: number;
  bgColor: string;
  bgImage?: string;
  hidden?: boolean;
  images: FolioImageLayer[];
  texts: FolioTextLayer[];
};

export type ProjectData = {
  slug: string;
  no: string;
  categoryId: CategoryId;
  categoryLabel: string;
  title: string;
  subtitle?: string;
  year: string;
  medium: string;
  durationOrSpec?: string;
  theme: PaletteTheme;
  heroImage: MediaItem;
  summary: string;
  tags: string[];
  honors?: string[];
  meta: {
    label: string;
    value: string;
  }[];
  pages: FolioPage[];
};

export type RecordPaper = {
  no: string;
  year: string;
  citation: string;
};

export type RecordExhibition = {
  year: string;
  event: string;
  work: string;
};

export type RecordEduOrTeach = {
  period: string;
  institution: string;
  role: string;
  detail: string;
};

export type ChapterInfo = {
  id: CategoryId;
  roman: string;
  title: string;
  subtitle: string;
  description: string;
  notes?: string[];
  tags?: string[];
  dividerImage?: MediaItem;
};

export type SiteConfig = {
  cover: {
    eyebrow: string;
    title: string;
    subtitle: string;
    span: string;
    intro: string;
    backgroundImage: string;
  };
  profile: {
    name: string;
    role: string;
    portrait: MediaItem;
    bio: string;
    directions: {
      title: string;
      description: string;
    }[];
  };
  records: {
    education: RecordEduOrTeach[];
    teaching: RecordEduOrTeach[];
    papers: RecordPaper[];
    exhibitions: RecordExhibition[];
  };
  chapters: ChapterInfo[];
  contact: {
    heading: string;
    closing: string;
    email: string;
    wechat: string;
    homeLabel: string;
    homeHref: string;
  };
};
