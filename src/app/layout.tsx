import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const studioSans = localFont({
  src: "./fonts/ibm-plex-sans-latin.woff2",
  weight: "400 600",
  style: "normal",
  variable: "--font-studio-sans",
  display: "swap",
});

const studioMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-400-latin.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-500-latin.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-studio-mono",
  display: "swap",
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
      className={`${studioSans.variable} ${studioMono.variable} h-full antialiased bg-[#050506] text-[#f5f6f8]`}
    >
      <body className="min-h-full flex flex-col selection:bg-[#f5f6f8] selection:text-[#050506]">
        {children}
      </body>
    </html>
  );
}
