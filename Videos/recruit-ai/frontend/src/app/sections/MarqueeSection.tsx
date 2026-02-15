export default function MarqueeSection() {
  return (
    <section className="py-12 bg-white border-y border-zinc-100 overflow-hidden">
      <div className="flex whitespace-nowrap justify-center">
        <div className="flex flex-none gap-20 items-center pr-20">
          <span className="text-4xl md:text-6xl font-black text-black uppercase tracking-tighter font-display">Precision Hiring.</span>
          <span className="text-4xl md:text-6xl font-black text-zinc-100 uppercase tracking-tighter font-display italic">Zero Compromise.</span>
          <span className="text-4xl md:text-6xl font-black text-black uppercase tracking-tighter font-display">Fast Scaling.</span>
          <span className="text-4xl md:text-6xl font-black text-zinc-100 uppercase tracking-tighter font-display italic">AI Powered.</span>
        </div>
      </div>
    </section>
  );
}