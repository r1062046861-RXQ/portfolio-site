"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function StudioHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 48);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`site-nav fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050506]/88 backdrop-blur-md"
          : "bg-gradient-to-b from-[#050506]/80 via-[#050506]/35 to-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 h-16 flex items-center justify-between gap-4">
        <a href="#top" className="shrink-0 flex items-baseline gap-3 group">
          <span className="text-sm sm:text-base font-medium tracking-[-0.01em] text-[#f5f6f8] whitespace-nowrap">
            <span className="md:hidden">液态像素艺术工作室</span>
            <span className="hidden md:inline">液态像素</span>
          </span>
          <span className="hidden md:inline text-[11px] font-mono tracking-[0.22em] text-[#9398a3] group-hover:text-[#c4c7ce] transition-colors uppercase">
            LIQUID PIXEL
          </span>
        </a>

        <nav aria-label="主导航" className="hidden md:flex items-center gap-7 text-sm text-[#c4c7ce]">
          <a href="#services" className="hover:text-[#f5f6f8] transition-colors whitespace-nowrap">
            合作
          </a>
          <a href="#works" className="hover:text-[#f5f6f8] transition-colors whitespace-nowrap">
            作品
          </a>
          <a href="#awards" className="hover:text-[#f5f6f8] transition-colors whitespace-nowrap">
            档案
          </a>
          <a href="#team" className="hover:text-[#f5f6f8] transition-colors whitespace-nowrap">
            团队
          </a>
          <Link
            href="/portfolio/"
            prefetch={false}
            className="inline-flex items-center gap-1 text-[#f5f6f8] hover:text-white/75 transition-colors whitespace-nowrap"
          >
            <span>任玄奇作品集</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </nav>

        <div className="shrink-0 flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/portfolio/"
            prefetch={false}
            className="md:hidden text-xs font-medium text-[#c4c7ce] hover:text-[#f5f6f8] whitespace-nowrap px-3 py-2 border border-white/20"
          >
            作品集
          </Link>
          <a
            href="#contact"
            className="px-3.5 py-2 text-xs sm:text-sm font-medium text-[#f5f6f8] border border-white/25 hover:border-white/75 hover:bg-white/5 transition-colors whitespace-nowrap"
          >
            预约
          </a>
        </div>
      </div>
      <div
        className={`h-px w-full transition-opacity duration-300 bg-white/10 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />
    </header>
  );
}
