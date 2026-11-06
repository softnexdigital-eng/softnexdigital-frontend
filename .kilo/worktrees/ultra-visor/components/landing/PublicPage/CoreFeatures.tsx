import { FiCheckCircle } from 'react-icons/fi';
import { CORE_FEATURES } from './constants';

export default function CoreFeatures() {
  return (
    <section className="py-20 px-4 sm:px-8 bg-white">
      <div className="max-w-8xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3">Core Features</p>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900">
            ব্যবসা চালানোর জন্য যা যা <span className="text-red-600">দরকার, সবই আছে</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CORE_FEATURES.map((f, i) => (
            <div
              key={i}
              className="group relative bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-red-100 to-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-red-500/25 mb-4">
                <f.icon size={22} />
              </div>
              <h3 className="relative text-base font-black text-zinc-900 mb-1.5">{f.title}</h3>
              <p className="relative text-[13px] text-zinc-500 leading-relaxed mb-4">{f.desc}</p>
              <ul className="relative space-y-1.5">
                {f.points.map((pt, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-[12px] text-zinc-600 font-medium">
                    <FiCheckCircle size={13} className="text-emerald-500 shrink-0" /> {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}