import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function FinalCallSection() {
  return (
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
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}