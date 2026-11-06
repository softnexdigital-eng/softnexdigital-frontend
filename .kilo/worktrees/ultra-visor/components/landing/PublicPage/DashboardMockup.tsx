'use client';

import { SIDEBAR_ITEMS, STAT_CARDS, TOP_PRODUCTS, RECENT_ORDERS, STATUS_STYLE } from './constants';

export default function DashboardMockup({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const sm = size === 'sm';
  return (
    <div className="flex h-full select-none overflow-hidden">
      {/* Sidebar */}
      <div className={`hidden sm:flex shrink-0 flex-col bg-zinc-950 ${sm ? 'w-[72px] py-2 px-1.5 gap-px' : 'w-[130px] py-3 px-2 gap-0.5'}`}>
        <div className={`flex items-center gap-1.5 ${sm ? 'px-1 py-1 mb-1' : 'px-2 py-2 mb-2'}`}>
          <span className={`rounded-md bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-black ${sm ? 'w-4 h-4 text-[6px]' : 'w-6 h-6 text-[9px]'}`}>S</span>
          {!sm && <span className="font-black text-white text-[9px] truncate">SOFTNEX</span>}
        </div>
        {SIDEBAR_ITEMS.map((item, i) => (
          <div
            key={item}
            className={`font-medium truncate rounded ${sm ? 'text-[5px] px-1.5 py-[2px]' : 'text-[8px] px-2 py-[3px]'} ${i === 0 ? 'bg-gradient-to-r from-red-600 to-red-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className={`flex-1 bg-zinc-50 overflow-hidden ${sm ? 'p-1.5 space-y-1' : 'p-3 space-y-2'}`}>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-1">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className={`bg-white border border-zinc-100 rounded-lg ${sm ? 'px-1 py-1' : 'px-2 py-1.5'}`}>
              <p className={`text-zinc-400 truncate ${sm ? 'text-[4px]' : 'text-[6px]'}`}>{s.label}</p>
              <p className={`font-black text-zinc-800 truncate ${sm ? 'text-[6px]' : 'text-[10px]'}`}>{s.value}</p>
              <p className={`font-semibold text-emerald-500 ${sm ? 'text-[4px]' : 'text-[6px]'}`}>{s.delta}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-3 gap-1">
          <div className={`col-span-2 bg-white border border-zinc-100 rounded-lg ${sm ? 'p-1' : 'p-2'}`}>
            <p className={`font-semibold text-zinc-400 mb-1 ${sm ? 'text-[4px]' : 'text-[6px]'}`}>Sales Overview</p>
            <svg viewBox="0 0 220 48" className={sm ? 'w-full h-5' : 'w-full h-10'}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                points="0,40 22,34 44,37 66,20 88,26 110,10 132,16 154,6 176,14 198,4 220,12"
                fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
              <polygon
                points="0,40 22,34 44,37 66,20 88,26 110,10 132,16 154,6 176,14 198,4 220,12 220,48 0,48"
                fill="url(#chartGrad)"
              />
            </svg>
          </div>
          <div className={`bg-white border border-zinc-100 rounded-lg flex flex-col items-center justify-center ${sm ? 'p-1 gap-0.5' : 'p-2 gap-1'}`}>
            <p className={`font-semibold text-zinc-400 ${sm ? 'text-[4px]' : 'text-[6px]'}`}>Order Status</p>
            <div
              className={`rounded-full ${sm ? 'w-7 h-7' : 'w-12 h-12'}`}
              style={{ background: 'conic-gradient(#f97316 0% 67%, #fbbf24 67% 89%, #ef4444 89% 100%)' }}
            />
            {!sm && (
              <div className="flex gap-1 mt-0.5">
                {[['#f97316', 'Done'], ['#fbbf24', 'Pend'], ['#ef4444', 'Fail']].map(([c, l]) => (
                  <span key={l} className="flex items-center gap-0.5 text-[5px] text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />{l}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom row — only lg */}
        {!sm && (
          <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-white border border-zinc-100 rounded-lg p-1.5">
              <p className="text-[6px] font-semibold text-zinc-400 mb-1">Top Products</p>
              <div className="space-y-1">
                {TOP_PRODUCTS.map((p) => (
                  <div key={p.name} className="flex items-center justify-between gap-1">
                    <span className="flex items-center gap-0.5 text-[6px] text-zinc-600 truncate">
                      <span>{p.icon}</span><span className="truncate">{p.name}</span>
                    </span>
                    <span className="text-[6px] font-semibold text-emerald-500 shrink-0">{p.delta}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-zinc-100 rounded-lg p-1.5">
              <p className="text-[6px] font-semibold text-zinc-400 mb-1">Recent Orders</p>
              <div className="space-y-1">
                {RECENT_ORDERS.map((o) => (
                  <div key={o.id} className="flex items-center justify-between gap-0.5">
                    <span className="truncate text-[5.5px] text-zinc-600">{o.name}</span>
                    <span className={`px-1 rounded-full font-semibold text-[4.5px] ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-zinc-100 rounded-lg p-1.5 flex flex-col items-center justify-center text-center">
              <span className="text-[10px]">⚠️</span>
              <p className="text-sm font-black text-zinc-800 leading-none">14</p>
              <p className="text-[5px] text-zinc-400 mt-0.5">Blocked this month</p>
              <button className="text-[5px] font-bold text-red-600 border border-red-300 rounded-full px-1.5 py-px mt-1">View All</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}