"use client";

import { useRef } from "react";
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from "framer-motion";

// Dynamically import sections with no SSR to reduce initial load
const HeroSection = dynamic(() => import('./sections/HeroSection'), { ssr: false });
const StatsSection = dynamic(() => import('./sections/StatsSection'), { ssr: false });
const MarqueeSection = dynamic(() => import('./sections/MarqueeSection'), { ssr: false });
const ProblemSection = dynamic(() => import('./sections/ProblemSection'), { ssr: false });
const ProcessSection = dynamic(() => import('./sections/ProcessSection'), { ssr: false });
const TestimonialSection = dynamic(() => import('./sections/TestimonialSection'), { ssr: false });
const FinalCallSection = dynamic(() => import('./sections/FinalCallSection'), { ssr: false });

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function LazyLoadedHome() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax transforms for background elements
  const heroTextY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  // Section background transitions
  const bgColor = useTransform(
    scrollYProgress,
    [0.1, 0.2, 0.4, 0.5, 0.7, 0.8],
    ["#ffffff", "#fafafa", "#fafafa", "#ffffff", "#ffffff", "#000000"]
  );

  return (
    <motion.div
      ref={containerRef}
      style={{ backgroundColor: bgColor }}
      className="flex flex-col text-black overflow-hidden selection:bg-black selection:text-white font-sans"
    >
      <div className="flex flex-col">
        <HeroSection 
          heroTextY={heroTextY} 
          opacity={opacity} 
          scale={scale} 
          staggerContainer={staggerContainer} 
          fadeIn={fadeIn} 
        />
        
        <StatsSection />
        <MarqueeSection />
        <ProblemSection />
        <ProcessSection />
        <TestimonialSection />
        <FinalCallSection />
      </div>
    </motion.div>
  );
}