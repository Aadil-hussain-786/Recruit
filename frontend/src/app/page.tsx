"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";

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

export default function Home() {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { damping: 50, stiffness: 200 });
  const springY = useSpring(mouseY, { damping: 50, stiffness: 200 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax transforms for background elements
  const y1 = useTransform(smoothProgress, [0, 1], [0, -300]);
  const y2 = useTransform(smoothProgress, [0, 1], [0, 300]);
  const heroTextY = useTransform(smoothProgress, [0, 0.2], [0, -50]);
  const opacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(smoothProgress, [0, 0.15], [1, 0.95]);

  // Section background transitions
  const bgColor = useTransform(
    smoothProgress,
    [0.1, 0.2, 0.4, 0.5, 0.7, 0.8],
    ["#ffffff", "#fafafa", "#fafafa", "#ffffff", "#ffffff", "#000000"]
  );

  const maskReveal = {
    initial: { y: "100%" },
    whileInView: { y: 0 },
    viewport: { once: true },
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
  };

  return (
    <motion.div
      ref={containerRef}
      style={{ backgroundColor: bgColor }}
      className="flex flex-col text-black overflow-hidden selection:bg-black selection:text-white font-sans"
    >
      {/* Static Holder for stable feel */}
      <div className="flex flex-col">

        {/* Hero Section - Refined & Ideative */}
        <section className="relative min-h-[75vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden pt-20">
          {/* Premium Background Layering */}
          <div className="absolute inset-0 z-0">
            {/* Soft Radial Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,0,0,0.03)_0%,transparent_70%)]" />

            {/* Noise Texture for Premium Feel */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            {/* Technical Mesh - More Subtle */}
            <svg className="absolute inset-0 h-full w-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="mesh" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#mesh)" />
            </svg>

            {/* Slow Moving Blobs for Depth */}
            <motion.div
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-100/50 rounded-full blur-[120px] will-change-transform"
            />
            <motion.div
              animate={{
                x: [0, -100, 0],
                y: [0, 50, 0],
              }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-200/30 rounded-full blur-[120px] will-change-transform"
            />
          </div>

          {/* Interactive Background Glow */}
          <motion.div
            style={{
              x: springX,
              y: springY,
              translateX: "-50%",
              translateY: "-50%",
            }}
            className="absolute top-0 left-0 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(0,0,0,0.015)_0%,transparent_70%)] pointer-events-none z-0 hidden lg:block will-change-transform"
          />

          {/* Abstract Floating Technical Elements */}
          <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.5, 0],
                  y: [0, -40, 0],
                  x: [0, (i % 2 ? 20 : -20), 0]
                }}
                transition={{
                  duration: 10 + i * 2,
                  repeat: Infinity,
                  delay: i * 1.5,
                  ease: "easeInOut"
                }}
                className="absolute text-[8px] font-mono text-zinc-400 will-change-transform"
                style={{
                  top: `${15 + i * 12}%`,
                  left: `${10 + (i * 17) % 80}%`
                }}
              >
                {['{ }', '< />', '01', 'NODE', 'SYNC', 'READY'][i]}
              </motion.div>
            ))}
          </div>

          {/* Floating Candidate Snippets - Premium Feel */}
          <div className="absolute inset-0 pointer-events-none hidden lg:block overflow-hidden">
            {[
              { top: '22%', left: '14%', delay: 0, text: "React Engineer", match: "98%" },
              { top: '32%', right: '16%', delay: 0.2, text: "Fullstack Dev", match: "94%" },
              { top: '60%', left: '20%', delay: 0.4, text: "Backend Dev", match: "99%" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, -12, 0],
                }}
                transition={{
                  opacity: { delay: 1.2 + item.delay, duration: 1 },
                  scale: { delay: 1.2 + item.delay, duration: 1 },
                  y: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute p-3 rounded-lg border border-zinc-200/50 bg-white/40 backdrop-blur-md shadow-[0_4px_20px_rgb(0,0,0,0.03)] z-20 flex items-center gap-3 transition-transform hover:scale-110 overflow-hidden group will-change-transform"
                style={{ top: item.top, left: item.left, right: item.right }}
              >
                {/* Shimmer Border */}
                <motion.div
                  className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-400/50 to-transparent"
                  animate={{ left: ["-100%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                  <span className="text-[8px] font-bold text-white uppercase italic">AI</span>
                </div>
                <div className="text-left">
                  <div className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">Match Logic</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-black">{item.match}</span>
                    <span className="text-[8px] font-medium text-zinc-500">{item.text}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            style={{ opacity, scale }}
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-6xl z-10 flex flex-col items-center"
          >
            <motion.div variants={fadeIn} className="mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/5 bg-white shadow-sm text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                AI-Powered Recruitment System
              </span>
            </motion.div>

            <div className="overflow-hidden mb-6 relative px-4">
              <motion.h1
                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ y: heroTextY }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] font-display uppercase italic text-zinc-900"
              >
                Engineer <br />
                <span className="relative">
                  <span className="bg-gradient-to-r from-zinc-500 via-zinc-900 to-zinc-500 bg-[length:200%_auto] animate-shimmer bg-clip-text text-transparent">Your Talent</span>
                </span> <br />
                Pipeline.
              </motion.h1>
            </div>

            <motion.p
              variants={fadeIn}
              className="text-lg md:text-xl lg:text-2xl leading-relaxed text-zinc-500 max-w-2xl mx-auto mb-16 font-sans tracking-tight"
            >
              Scale your engineering team with zero friction. We use neural-weighted
              sourcing to identify and screen the top 1% of technical talent.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full max-w-md mx-auto">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  variant="premium"
                  className="w-full sm:w-[200px] py-6 text-sm font-bold tracking-[0.15em] uppercase rounded-none bg-black text-white hover:bg-zinc-900 border-black shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] transform transition-all hover:-translate-y-0.5"
                >
                  Start Hiring
                </Button>
              </Link>
              <Link href="/jobs" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-[180px] py-6 text-sm font-bold tracking-[0.05em] uppercase border border-zinc-200 rounded-none bg-white hover:bg-zinc-50 transition-all duration-300"
                >
                  Browse Jobs
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="flex items-center gap-8 opacity-30 mt-8"
            >
              <div className="h-px w-10 bg-zinc-200" />
              <div className="flex gap-10 items-center grayscale hover:grayscale-0 transition-all duration-700 opacity-60">
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">Stripe</span>
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">Linear</span>
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">Scale</span>
              </div>
              <div className="h-px w-10 bg-zinc-200" />
            </motion.div>
          </motion.div>

          {/* Premium Mouse Scroll Indicator */}
          <div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 hidden md:flex"
          >
            <div className="w-6 h-10 border-2 border-zinc-200 rounded-full flex justify-center p-2">
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-1 h-1.5 bg-black rounded-full"
              />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-300">Scroll</span>
          </div>
        </section>

        {/* High Contrast Stats - Sticky Feel */}
        <section className="bg-black text-white py-32 relative z-20">
          <div className="mx-auto max-w-7xl px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 lg:gap-24">
              {[
                { value: "50-300", label: "Monthly Candidates", color: "text-zinc-100" },
                { value: ">10×", label: "Measured ROI", color: "text-white" },
                { value: "85%+", label: "Match Accuracy", color: "text-zinc-100" },
                { value: "$0", label: "Upfront Commitment", color: "text-white" },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col items-center text-center p-12 border border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm rounded-2xl group hover:border-zinc-500 transition-all duration-500"
                >
                  <div className={`text-6xl lg:text-8xl font-black tracking-tighter ${stat.color} group-hover:italic transition-all duration-300 font-display mb-4`}>
                    {stat.value}
                  </div>
                  <div className="w-12 h-[2px] bg-zinc-800 group-hover:w-full transition-all duration-500 mb-6" />
                  <div className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-500">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Infinite Scroll Marquee */}
        <section className="py-12 bg-white border-y border-zinc-100 overflow-hidden">
          <div className="flex whitespace-nowrap">
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="flex flex-none gap-20 items-center pr-20 will-change-transform"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-20 items-center">
                  <span className="text-4xl md:text-6xl font-black text-black uppercase tracking-tighter font-display">Precision Hiring.</span>
                  <span className="text-4xl md:text-6xl font-black text-zinc-100 uppercase tracking-tighter font-display italic">Zero Compromise.</span>
                  <span className="text-4xl md:text-6xl font-black text-black uppercase tracking-tighter font-display">Fast Scaling.</span>
                  <span className="text-4xl md:text-6xl font-black text-zinc-100 uppercase tracking-tighter font-display italic">AI Powered.</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Problem Section - Large Editorial Look */}
        <section className="py-48 bg-white relative">
          <div className="mx-auto max-w-4xl px-8 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-16 overflow-hidden"
            >
              <h2 className="text-xs font-bold tracking-[0.5em] text-zinc-400 uppercase mb-8">The Challenge</h2>
              <div className="overflow-hidden">
                <motion.p
                  variants={maskReveal}
                  className="text-5xl md:text-8xl font-black leading-none tracking-tight text-black font-display uppercase italic"
                >
                  Full calendars, <br />
                  <span className="text-zinc-200">Zero focus.</span>
                </motion.p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="w-full"
            >
              <p className="text-xl md:text-3xl text-zinc-500 leading-tight font-sans mb-16 max-w-2xl mx-auto">
                Too many screening calls with the wrong candidates. Too much time wasted.
                We solve this with precision targeting and AI-powered qualification.
              </p>
              <div className="h-[2px] w-full bg-zinc-100 flex items-center max-w-md mx-auto">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="h-full bg-black"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Process Section - Horizontal Scroll feel but vertical */}
        <section className="py-32 bg-zinc-50">
          <div className="mx-auto max-w-7xl px-8">
            <div className="mb-32 text-center overflow-hidden">
              <h2 className="text-xs font-bold tracking-[0.4em] text-zinc-500 uppercase mb-6">Our Blueprint</h2>
              <div className="overflow-hidden">
                <motion.p
                  variants={maskReveal}
                  className="text-6xl md:text-9xl font-black tracking-tighter uppercase font-display leading-none"
                >
                  The Path to <br />
                  <span className="italic">Excellence.</span>
                </motion.p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-1px bg-zinc-200 border border-zinc-200">
              {[
                {
                  step: "01",
                  title: "Context Drill",
                  desc: "We analyze your tech stack, culture DNA, and roadmap to build a 1:1 candidate profile.",
                  bg: "bg-white"
                },
                {
                  step: "02",
                  title: "Neural Sourcing",
                  desc: "Our AI engines crawl 50+ platforms simultaneously to identify hidden 10x talent.",
                  bg: "bg-zinc-50"
                },
                {
                  step: "03",
                  title: "Prime Arrivals",
                  desc: "Receive interview-ready shortlists. We handle the friction, you handle the hiring.",
                  bg: "bg-white"
                }
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className={`${step.bg} p-16 min-h-[500px] flex flex-col justify-between group hover:bg-black hover:text-white transition-all duration-700 relative overflow-hidden`}
                >
                  {/* Background Numbering */}
                  <div className="absolute top-[-10%] right-[-5%] text-[15rem] font-black text-zinc-100 group-hover:text-zinc-900/20 transition-colors pointer-events-none font-display">
                    {step.step}
                  </div>

                  <div className="relative z-10">
                    <span className="text-4xl font-black font-display mb-12 block group-hover:italic transition-all">/{step.step}</span>
                    <h3 className="text-4xl font-black uppercase tracking-tight mb-8 font-display">{step.title}</h3>
                    <p className="text-lg text-zinc-400 group-hover:text-zinc-300 leading-relaxed max-w-xs">{step.desc}</p>
                  </div>
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-12 h-[1px] bg-black group-hover:bg-white transition-colors" />
                    <span className="text-[11px] font-black tracking-[0.4em] uppercase opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">Deep Dive</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial - Cinematic Feel */}
        <section className="py-64 bg-white overflow-hidden relative">
          <motion.div
            style={{ x: y1 }}
            className="absolute top-1/2 left-0 text-[20vw] font-black text-zinc-50 whitespace-nowrap select-none -z-10 leading-none"
          >
            SUCCESS • SUCCESS • SUCCESS
          </motion.div>

          <div className="mx-auto max-w-5xl px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-black mb-12 rounded-full overflow-hidden flex items-center justify-center p-4">
                <div className="w-full h-[1px] bg-white rotate-45" />
                <div className="w-full h-[1px] bg-white -rotate-45 absolute" />
              </div>
              <p className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] mb-12 uppercase italic font-display">
                "We went from 50 to 300+ qualified candidates. The quality of hires has <span className="underline decoration-zinc-100 decoration-8 underline-offset-4">never</span> been better."
              </p>
              <div>
                <p className="font-black text-xl uppercase tracking-widest text-black">Tech Startup CEO</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.5em] mt-2">Scale AI Partner</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final Call - Massive & Bold */}
        <section className="bg-black text-white py-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,27,1)_0%,rgba(0,0,0,1)_100%)] opacity-50" />

          <div className="mx-auto max-w-7xl px-8 text-center relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-6xl md:text-9xl font-black tracking-[-0.06em] leading-[0.85] mb-20 font-display uppercase"
            >
              Your next <br />
              <span className="italic text-zinc-800">10x hire</span> <br />
              is waiting.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/register">
                <Button
                  size="lg"
                  variant="premium"
                  className="bg-zinc-100 text-black hover:bg-white transition-all duration-500 px-20 py-10 text-xl font-black tracking-[0.3em] uppercase rounded-none border-none relative group overflow-hidden"
                >
                  <span className="relative z-10">Join Recruit AI</span>
                  <motion.div
                    className="absolute inset-0 bg-zinc-400"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

      </div>
    </motion.div>
  );
}
