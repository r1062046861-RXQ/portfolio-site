import type { CategoryId, ProjectData, SiteConfig } from "./schema";
import rawSite from "./site.json";
import p01 from "./projects/01-millennium-phantom.json";
import p02 from "./projects/02-sleepless.json";
import p03 from "./projects/03-awakening.json";
import p04 from "./projects/04-collapse.json";
import p05 from "./projects/05-against-the-current.json";
import p06 from "./projects/06-biological-alchemy.json";
import p07 from "./projects/07-national-arts-fund.json";
import p08 from "./projects/08-digital-art-anthology.json";
import p09 from "./projects/09-design-your-future.json";
import p10 from "./projects/10-yangliuqing-aigc.json";
import p11 from "./projects/11-red-chamber-aesthetics.json";
import p12 from "./projects/12-china-science-museum.json";
import p13 from "./projects/13-tianjin-sci-art-contest.json";
import p14 from "./projects/14-tafa-2024-graduation.json";
import p15 from "./projects/15-china-daily-ma-yuan.json";
import p16 from "./projects/16-jiading-wonder-trip.json";
import p17 from "./projects/17-kuaishou-2025.json";

export const siteConfig = rawSite as SiteConfig;

export const allProjects: ProjectData[] = [
  p01,
  p02,
  p03,
  p04,
  p05,
  p06,
  p07,
  p08,
  p09,
  p10,
  p11,
  p12,
  p13,
  p14,
  p15,
  p16,
  p17,
] as ProjectData[];

export function getProjectBySlug(slug: string): ProjectData | undefined {
  return allProjects.find((p) => p.slug === slug);
}

export function getAdjacentProjects(slug: string): {
  prev: ProjectData | null;
  next: ProjectData | null;
} {
  const idx = allProjects.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: allProjects[(idx - 1 + allProjects.length) % allProjects.length],
    next: allProjects[(idx + 1) % allProjects.length],
  };
}

export function getChapterProjects(categoryId: CategoryId): ProjectData[] {
  return allProjects.filter((p) => p.categoryId === categoryId);
}
