import type { Metadata } from "next";
import { allProjects, siteConfig } from "@/data/portfolio2025";
import { PortfolioHome } from "./_components/PortfolioHome";
import "./portfolio.css";

export const metadata: Metadata = {
  title: "任玄奇作品集 | 数字艺术 · 虚拟现实艺术 · 实验影像",
  description:
    "任玄奇作品集（2021—2026）：涵盖艺术创作、科研课题项目与商业项目共 17 件完整档案，以及最新学术论文与展览展映记录。",
};

export default function PortfolioPage() {
  return <PortfolioHome initialSite={siteConfig} projects={allProjects} />;
}
