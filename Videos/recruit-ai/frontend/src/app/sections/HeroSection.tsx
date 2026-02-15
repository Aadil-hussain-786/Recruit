import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function HeroSection({ heroTextY, opacity, scale, staggerContainer, fadeIn }) {
  return (
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

        {/* Static Blobs for Depth - No animation */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-100/50 rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-200/30 rounded-full blur-[120px] opacity-20" />
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

      {/* Simplified Mouse Scroll Indicator */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 hidden md:flex"
      >
        <div className="w-6 h-10 border-2 border-zinc-200 rounded-full flex justify-center p-2">
          <div className="w-1 h-1.5 bg-black rounded-full animate-bounce" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-300">Scroll</span>
      </div>
    </section>
  );
}