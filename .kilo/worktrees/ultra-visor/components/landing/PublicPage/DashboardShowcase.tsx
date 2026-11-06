'use client';

import { useState } from 'react';
import DashboardMockup from './DashboardMockup';
import { DASHBOARD_TABS, DASHBOARD_TAB_HIGHLIGHTS } from './constants';

export default function DashboardShowcase() {
  const [activeTab, setActiveTab] = useState<typeof DASHBOARD_TABS[number]>('Orders');
  const highlight = DASHBOARD_TAB_HIGHLIGHTS[activeTab];

  return (
    <section className="py-20 px-4 sm:px-8 bg-red-50/40 border-y border-red-100">
      <div className="max-w-8xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3">Dashboard Showcase</p>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900">
            সুন্দর ও পাওয়ারফুল <span className="text-red-600">Admin Dashboard</span>
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {DASHBOARD_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[13px] font-bold px-4 py-2 rounded-full transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/25'
                  : 'bg-white text-zinc-500 border border-zinc-200 hover:border-red-300 hover:text-red-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-6">
          <div className="flex-[1.5] bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-zinc-900 px-4 py-2.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-zinc-400 text-[11px] ml-2 font-medium">Softnex Dashboard — {activeTab}</span>
            </div>
            <div className="h-[290px] sm:h-[320px]">
              <DashboardMockup size="lg" />
            </div>
          </div>

          <div className="flex-1 bg-white border border-red-100 rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col justify-center text-left">
            <h3 className="text-base sm:text-lg font-black text-red-600 mb-1">{highlight.title}</h3>
            <p className="text-[13px] text-zinc-500 leading-relaxed mb-6">{highlight.desc}</p>
            <div className="bg-gradient-to-br from-red-50 to-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-2xl font-black text-zinc-900">{highlight.metric}</p>
              <p className="text-[11px] text-zinc-500 font-medium">{highlight.metricLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}