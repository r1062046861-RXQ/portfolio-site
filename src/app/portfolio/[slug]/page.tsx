import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  allProjects,
  getAdjacentProjects,
  getProjectBySlug,
} from "@/data/portfolio2025";
import { ProjectDetailView } from "../_components/ProjectDetailView";
import "../portfolio.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return allProjects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    return { title: "未找到作品 | 任玄奇作品集" };
  }
  return {
    title: `${project.title} (${project.no}) | 任玄奇作品集`,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    notFound();
  }
  const { prev, next } = getAdjacentProjects(slug);
  return (
    <ProjectDetailView
      initialProject={project}
      prevProject={prev}
      nextProject={next}
    />
  );
}
