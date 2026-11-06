'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { PRICING_PLANS } from './constants';

export default function Pricing() {
  const [activePlan, setActivePlan] = useState(1);

  return (
    <section className="py-20 px-4 sm:px-8 bg-white">
      <div className="max-w-8xl mx-auto text-center w-full">
        <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3">Pricing</p>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-2">সহজ ও স্বচ্ছ মূল্য পরিকল্পনা</h2>
        <p className="text-sm text-zinc-500 mb-10">মাসিক চার্জ নেই — একবার পেমেন্ট, চিরকালের জন্য আপনার।</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-5xl mx-auto items-stretch">
          {PRICING_PLANS.map((plan, i) => (
            <div
              key={i}
              onClick={() => setActivePlan(i)}
              className={`relative rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden ${
                plan.popular
                  ? 'shadow-2xl shadow-red-500/20'
                  : activePlan === i
                    ? 'shadow-lg shadow-red-100'
                    : 'shadow-sm hover:shadow-md'
              }`}
            >
              <div className={plan.popular ? 'p-[2px] bg-gradient-to-br from-red-400 to-red-500 rounded-2xl h-full' : 'border border-zinc-200 rounded-2xl h-full'}>
                <div className={`bg-white rounded-[14px] p-6 sm:p-7 flex flex-col h-full ${activePlan === i && !plan.popular ? 'border-2 border-red-300' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden z-10 pointer-events-none">
                      <span className="absolute top-[22px] right-[-32px] w-[150px] rotate-45 bg-red-600 text-white text-[9px] font-black text-center py-1">MOST POPULAR</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-[15px] font-black text-zinc-900 mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-3xl font-black text-zinc-900">৳{plan.price}</span>
                      <span className="text-xs text-zinc-400">/ এককালীন</span>
                    </div>
                    <div className="h-px bg-zinc-100 mb-4" />
                    <ul className="space-y-2.5 mb-6">
                      {plan.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[13px] text-zinc-600">
                          <FiCheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href="/auth/login"
                    className={`block w-full text-center py-3 rounded-xl text-sm font-bold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md shadow-red-500/20'
                        : 'border border-red-400 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500'
                    }`}
                  >
                    এখনই শুরু করুন
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}