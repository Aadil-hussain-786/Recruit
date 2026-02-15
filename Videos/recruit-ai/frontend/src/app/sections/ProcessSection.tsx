import { motion } from "framer-motion";

export default function ProcessSection() {
  return (
    <section className="py-32 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-32 text-center overflow-hidden">
          <h2 className="text-xs font-bold tracking-[0.4em] text-zinc-500 uppercase mb-6">Our Blueprint</h2>
          <div className="overflow-hidden">
            <motion.p
              initial={{ opacity: 0, y: "100%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
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
  );
}