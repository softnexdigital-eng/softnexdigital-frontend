import { FiStar, FiArrowRight } from 'react-icons/fi';
import { TESTIMONIALS } from './constants';

export default function Testimonials() {
  return (
    <section className="py-20 px-4 sm:px-8 bg-white">
      <div className="max-w-8xl mx-auto text-center">
        <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3">Client Success Stories</p>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-2">আমাদের ক্লায়েন্টরা যা বলে</h2>
        <div className="flex items-center justify-center gap-1 mb-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <FiStar key={i} size={13} className="text-red-400 fill-red-400" />
          ))}
          <span className="text-xs text-zinc-500 ml-1.5">4.9/5 (1300+ Reviews) · 5000+ Happy Clients</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow text-left">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <FiStar key={idx} size={11} className="text-red-400 fill-red-400" />
                ))}
              </div>

              {/* Messenger-style bubble */}
              <div className="bg-zinc-50 border border-zinc-100 rounded-2xl rounded-tl-sm px-4 py-3 mb-4">
                <p className="text-[13px] text-zinc-600 leading-relaxed">{t.quote}</p>
              </div>

              {/* Before / after */}
              <div className="flex items-center gap-2 mb-5 text-[11px] font-semibold">
                <span className="bg-red-50 text-red-500 px-2.5 py-1 rounded-full">{t.before}</span>
                <FiArrowRight size={12} className="text-zinc-300 shrink-0" />
                <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">{t.after}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-black shadow-md`}>
                  {t.initial}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-zinc-900">{t.name}</p>
                  <p className="text-[11px] text-zinc-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}