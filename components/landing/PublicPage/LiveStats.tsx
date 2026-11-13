import AnimatedCounter from './AnimatedCounter';
import { LIVE_STATS } from './constants';

export default function LiveStats() {
  return (
    <section className="relative bg-zinc-950 py-14 px-4 sm:px-8 overflow-hidden">
      <div className="absolute -top-24 left-1/4 w-72 h-72 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-72 h-72 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-8xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 divide-x divide-zinc-800/0 sm:divide-x">
        {LIVE_STATS.map((s, i) => (
          <div key={i} className="text-center px-2">
            <p className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-500">
              <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals ?? 0} />
            </p>
            <p className="text-[11px] sm:text-xs text-zinc-400 font-medium mt-1.5 tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}