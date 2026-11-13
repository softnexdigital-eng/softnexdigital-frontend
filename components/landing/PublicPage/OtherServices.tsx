import { OTHER_SERVICES } from './constants';

export default function OtherServices() {
  return (
    <section className="py-20 px-4 sm:px-8 bg-red-50/30 border-y border-red-100">
      <div className="max-w-8xl mx-auto text-center">
        <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">More Services</p>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-10">
          আমাদের <span className="text-red-600">অন্যান্য সার্ভিসসমূহ</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {OTHER_SERVICES.map((s, i) => (
            <div
              key={i}
              className="bg-white border border-zinc-100 rounded-xl p-4 flex flex-col items-center text-center gap-2 shadow-sm hover:border-red-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} ${s.color} group-hover:scale-105 transition-transform`}>
                <s.icon size={18} />
              </div>
              <p className="text-[11px] font-semibold text-zinc-600 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}