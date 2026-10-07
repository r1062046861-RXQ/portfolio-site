import type { Metadata } from "next";
import PortfolioExperience from "./PortfolioExperience";
import "./portfolio.css";

export const metadata: Metadata = {
  title: "任玄奇作品集 | 虚拟现实与科技艺术",
  description: "任玄奇的艺术创作、论文会议、人才培养项目与展览展映记录。",
};

export default function Portfolio() {
  return <PortfolioExperience />;
}
