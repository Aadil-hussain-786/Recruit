import { motion } from "framer-motion";

export default function StatsSection() {
  return (
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
  );
}