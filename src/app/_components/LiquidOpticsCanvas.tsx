"use client";

import { useEffect, useRef } from "react";

type RibbonSpec = {
  baseY: number;
  amp: number;
  freq: number;
  speed: number;
  phase: number;
  alpha: number;
  width: number;
};

const RIBBONS: RibbonSpec[] = [
  { baseY: 0.14, amp: 28, freq: 0.0024, speed: 0.42, phase: 0.4, alpha: 0.16, width: 1.4 },
  { baseY: 0.19, amp: 42, freq: 0.0018, speed: 0.31, phase: 1.9, alpha: 0.09, width: 2.6 },
  { baseY: 0.84, amp: 34, freq: 0.0021, speed: 0.36, phase: 2.7, alpha: 0.17, width: 1.3 },
  { baseY: 0.89, amp: 46, freq: 0.0016, speed: 0.25, phase: 4.1, alpha: 0.08, width: 2.8 },
];

export default function LiquidOpticsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let isVisible = true;
    let rafId = 0;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFrame = (timeSec: number) => {
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);

      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;

      const pxOffset = (pointer.x - 0.5) * 44;
      const pyOffset = (pointer.y - 0.5) * 28;

      // 极克制的角落水银光学丝带，模拟暗房镜头边角液体折射
      for (const r of RIBBONS) {
        ctx.save();
        ctx.beginPath();
        const yBase = height * r.baseY + pyOffset * (r.baseY > 0.5 ? 0.8 : -0.6);
        const step = Math.max(24, Math.floor(width / 38));

        for (let x = -40; x <= width + 40; x += step) {
          const waveA = Math.sin(x * r.freq + timeSec * r.speed + r.phase) * r.amp;
          const waveB = Math.cos(x * r.freq * 1.65 - timeSec * r.speed * 0.7 + pxOffset * 0.015) * (r.amp * 0.45);
          const y = yBase + waveA + waveB;
          if (x === -40) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        const grad = ctx.createLinearGradient(0, yBase - 40, width, yBase + 40);
        grad.addColorStop(0, `rgba(225, 230, 240, ${r.alpha * 1.25})`);
        grad.addColorStop(0.28, `rgba(182, 192, 208, ${r.alpha * 0.35})`);
        grad.addColorStop(0.62, "rgba(182, 192, 208, 0)");
        grad.addColorStop(1, `rgba(235, 240, 248, ${r.alpha})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = r.width;
        ctx.stroke();
        ctx.restore();
      }

      // 左侧边缘液态玻璃高光垂线
      const edgeGrad = ctx.createLinearGradient(0, 0, width * 0.16, height);
      edgeGrad.addColorStop(0, "rgba(240, 244, 250, 0.12)");
      edgeGrad.addColorStop(0.5, "rgba(195, 204, 218, 0.02)");
      edgeGrad.addColorStop(1, "rgba(240, 244, 250, 0.14)");

      ctx.save();
      ctx.beginPath();
      const leftAnchor = Math.max(24, width * 0.03) + pxOffset * 0.25;
      for (let y = 0; y <= height; y += 28) {
        const curve = Math.sin(y * 0.0045 + timeSec * 0.48) * 18 + Math.cos(y * 0.009 - timeSec * 0.26) * 8;
        const x = leftAnchor + curve;
        if (y === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = edgeGrad;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    };

    const tick = (now: number) => {
      if (!isVisible || reducedMotion) return;
      drawFrame(now * 0.001);
      rafId = window.requestAnimationFrame(tick);
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.tx = (e.clientX - rect.left) / rect.width;
      pointer.ty = (e.clientY - rect.top) / rect.height;
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
      window.cancelAnimationFrame(rafId);
      if (reducedMotion) {
        drawFrame(1.2);
      } else if (isVisible) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? true;
        window.cancelAnimationFrame(rafId);
        if (isVisible && !reducedMotion) {
          rafId = window.requestAnimationFrame(tick);
        }
      },
      { threshold: 0.05 }
    );

    resize();
    drawFrame(1.2);
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    motionQuery.addEventListener("change", handleMotionChange);

    if (!reducedMotion) {
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-print-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full z-[3]"
    />
  );
}
