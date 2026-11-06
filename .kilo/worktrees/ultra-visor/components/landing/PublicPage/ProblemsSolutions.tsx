import { PROBLEMS, SOLUTIONS } from './constants';

export default function ProblemsSolutions() {
  return (
    <section className="relative bg-zinc-950 py-20 px-4 sm:px-8 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-8xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Why People Fail</p>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            ব্যবসায়ীরা কেন <span className="text-red-500">পিছিয়ে পড়ে?</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-4 items-start">
          {/* Problems */}
          <div className="lg:pr-6 lg:border-r lg:border-zinc-800">
            <p className="text-[11px] font-bold text-red-400 uppercase tracking-widest mb-4">সমস্যা</p>
            <div className="space-y-3">
              {PROBLEMS.map((p, i) => (
                <div key={i} className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3">
                  <span className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 font-black text-xs">✕</span>
                  <p className="text-[13px] text-zinc-300 font-medium leading-snug">{p.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div className="lg:pl-6">
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-4">আমাদের সমাধান</p>
            <div className="space-y-3">
              {SOLUTIONS.map((s, i) => (
                <div key={i} className="flex items-center gap-3 bg-gradient-to-r from-red-500/10 to-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 font-black text-xs">✓</span>
                  <p className="text-[13px] text-zinc-200 font-medium leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}