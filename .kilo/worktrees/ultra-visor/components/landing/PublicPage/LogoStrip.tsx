export default function LogoStrip() {
  const logos = Array.from({ length: 6 });
  return (
    <section className="py-10 px-4 sm:px-8 border-b border-zinc-100">
      <p className="text-center text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-6">Trusted by 5000+ Business Owners</p>
      <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 sm:gap-10">
        {logos.map((_, i) => (
          <div key={i} className="h-7 w-24 bg-zinc-100 rounded-md flex items-center justify-center">
            <span className="text-[10px] font-semibold text-zinc-300">logoipsum</span>
          </div>
        ))}
      </div>
    </section>
  );
}