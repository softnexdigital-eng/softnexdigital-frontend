import { ECOMMERCE_FLOW } from './constants';

export default function EcommerceFlow() {
  return (
    <section className="py-20 px-4 sm:px-8 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3">Complete Flow</p>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-2">
          প্রোডাক্ট থেকে পেমেন্ট — <span className="text-red-600">সম্পূর্ণ প্রক্রিয়া</span>
        </h2>
        <p className="text-sm text-zinc-500 mb-14">৭টি সহজ ধাপে আপনার অনলাইন ব্যবসা চালু থেকে আয় পর্যন্ত।</p>

        <div className="relative">
          {/* connecting line */}
          <div className="hidden lg:block absolute top-7 left-0 right-0 h-px bg-gradient-to-r from-red-200 via-red-300 to-red-200" />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-8">
            {ECOMMERCE_FLOW.map((s, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-black text-sm mb-3 shadow-lg shadow-red-500/25">
                  {s.step}
                </div>
                <h3 className="text-[12.5px] font-bold text-zinc-900 mb-1 leading-snug">{s.title}</h3>
                <p className="text-[11px] text-zinc-500 leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}