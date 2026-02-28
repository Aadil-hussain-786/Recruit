"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface PaperStackProps {
  layers?: number;
}

export default function PaperStack({ layers = 5 }: PaperStackProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section ref={ref} className="relative h-[220vh] bg-white">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(layers)].map((_, i) => {
            const p = (i + 1) / layers; // 0..1
            const y = useTransform(scrollYProgress, [0, 1], [40 * (layers - i), -60 * i]);
            const r = useTransform(scrollYProgress, [0, 1], [2 * (layers - i), -4 * i]);
            const s = useTransform(scrollYProgress, [0, 1], [1 - p * 0.05, 1 - p * 0.02]);
            return (
              <motion.div
                key={i}
                style={{ y, rotate: r, scale: s }}
                className="absolute w-[min(86vw,1080px)] h-[min(60vh,560px)] rounded-3xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.08)] border border-zinc-200 will-change-transform"
              >
                <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "radial-gradient(1200px_400px_at_10%_0%,#000,transparent)" }} />
                <div className="p-10 h-full flex flex-col justify-between">
                  <div className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400">Layer {i + 1}</div>
                  <div className="font-display text-3xl md:text-5xl font-black tracking-tight">
                    Composable, scroll‑driven surfaces
                  </div>
                  <div className="text-zinc-500 max-w-xl">
                    Each sheet animates with subtle parallax, scale and rotation to evoke paper depth while remaining GPU‑friendly.
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
