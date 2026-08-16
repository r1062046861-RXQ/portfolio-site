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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-black text-white`}
    >
      <body className="min-h-full flex flex-col selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
