import { BUSINESS_TYPES } from './constants';

export default function BusinessTypes() {
  return (
    <section className="py-20 px-4 sm:px-8 bg-zinc-950">
      <div className="max-w-8xl mx-auto text-center">
        <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Built for Every Business</p>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-10">
          আপনার <span className="text-red-500">বিজনেস টাইপ</span> বেছে নিন
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-9 gap-3">
          {BUSINESS_TYPES.map((b, i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-red-600/50 hover:bg-zinc-800/60 transition-all duration-200 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{b.emoji}</span>
              <p className="text-[10.5px] font-semibold text-zinc-400 group-hover:text-white text-center leading-snug">{b.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}