import { motion } from "framer-motion";

export default function TestimonialSection() {
  return (
    <section className="py-64 bg-white overflow-hidden relative">
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
  );
}