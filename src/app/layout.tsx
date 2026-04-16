import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "液态像素工作室 | 跨媒体艺术与前沿技术团队",
  description: "由跨媒体艺术创作者与青年学者组建的复合型团队。致力于将前沿算法与多元媒介深度融合，提供涵盖数字影像创意、多感官公共艺术、文化 IP 数字化、定制化网页交互开发及 AIGC 技能培训的综合解决方案。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-black text-white`}
    >
      <body className="min-h-full flex flex-col selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
