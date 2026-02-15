import { motion } from "framer-motion";

const maskReveal = {
  initial: { y: "100%" },
  whileInView: { y: 0 },
  viewport: { once: true },
  transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
};

export default function ProblemSection() {
  return (
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
  );
}