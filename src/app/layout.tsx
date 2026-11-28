import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const studioSans = IBM_Plex_Sans({
  variable: "--font-studio-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const studioMono = IBM_Plex_Mono({
  variable: "--font-studio-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "液态像素艺术工作室 | 企业与艺术家技术协作",
  description: "帮助企业团队减少重复工作、把事情做顺，也协助艺术家和创作团队实现新媒体、影像与影视项目中的技术想法。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${studioSans.variable} ${studioMono.variable} h-full antialiased bg-[#0b0b0a] text-[#f4f1ea]`}
    >
      <body className="min-h-full flex flex-col selection:bg-white selection:text-[#0b0b0a]">
        {children}
      </body>
    </html>
  );
}
