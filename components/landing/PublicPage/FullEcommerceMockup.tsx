'use client';

import { FiShoppingCart, FiStar } from 'react-icons/fi';

const PRODUCTS = [
  { id: 1, name: 'প্রিমিয়াম টি-শার্ট', price: '১,২৫০', emoji: '👕', colors: ['bg-red-500', 'bg-blue-500', 'bg-black'] },
  { id: 2, name: 'ওয়্যারলেস ইয়ারবাডস', price: '২,৪৯০', emoji: '🎧', colors: ['bg-white', 'bg-black', 'bg-red-500'] },
  { id: 3, name: 'স্মার্ট ওয়াচ', price: '৩,৭৯০', emoji: '⌚', colors: ['bg-gray-300', 'bg-black', 'bg-blue-500'] },
  { id: 4, name: 'রানিং জুতা', price: '২,৯৯০', emoji: '👟', colors: ['bg-red-500', 'bg-white', 'bg-blue-500'] },
];

export default function FullEcommerceMockup() {
  const selected = PRODUCTS[0];

  return (
    <div className="bg-gradient-to-b from-zinc-200 via-zinc-100 to-zinc-200 rounded-[18px] p-[3px] shadow-2xl shadow-red-200/40">
      <div className="bg-zinc-900 rounded-[15px] pt-3 px-1.5 pb-1.5 relative">
        <span className="absolute top-[6px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-zinc-700" />
        <div className="bg-white rounded-[8px] overflow-hidden h-[520px] w-full flex flex-col">
          {/* Top Nav */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 bg-white">
            <div className="flex items-center gap-3">
              <span className="font-black text-sm text-zinc-900">SOFTNEX</span>
              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">শপ</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="hover:text-red-500 cursor-pointer">হোম</span>
              <span className="hover:text-red-500 cursor-pointer">পণ্য</span>
              <span className="hover:text-red-500 cursor-pointer">অফার</span>
              <span className="relative">
                <FiShoppingCart size={16} />
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">৩</span>
              </span>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left: Product Grid */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {PRODUCTS.map((p) => (
                  <div key={p.id} className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-1">{p.emoji}</div>
                    <p className="text-[12px] font-bold text-zinc-800">{p.name}</p>
                    <p className="text-[11px] font-semibold text-zinc-700">৳{p.price}</p>
                    <div className="flex gap-1 mt-1">
                      {p.colors.slice(0, 3).map((c, i) => (
                        <span key={i} className={`w-3 h-3 rounded-full border border-zinc-200 ${c}`} />
                      ))}
                    </div>
                    <button className="mt-2 w-full text-[10px] font-bold text-red-600 border border-red-200 rounded-lg py-1 hover:bg-red-50 transition-colors">
                      দেখুন
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Product Detail + Cart */}
            <div className="w-[220px] bg-red-50/30 border-l border-red-100 p-4 flex flex-col">
              <h4 className="text-xs font-bold text-red-600 mb-2">পণ্যের বিবরণ</h4>
              <div className="bg-white rounded-xl p-3 flex-1">
                <div className="text-5xl text-center">{selected.emoji}</div>
                <p className="text-sm font-bold text-zinc-900 mt-1">{selected.name}</p>
                <div className="flex items-center gap-1 text-[10px] text-red-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar key={i} className="fill-red-400" size={12} />
                  ))}
                  <span className="text-zinc-400 ml-1">(১২০)</span>
                </div>
                <p className="text-lg font-black text-zinc-900 mt-1">৳{selected.price}</p>
                <div className="mt-2">
                  <p className="text-[10px] text-zinc-500">রঙ</p>
                  <div className="flex gap-1.5 mt-1">
                    {selected.colors.map((c, i) => (
                      <span key={i} className={`w-5 h-5 rounded-full border border-zinc-200 ${c}`} />
                    ))}
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-[10px] text-zinc-500">সাইজ</p>
                  <div className="flex gap-1 mt-1">
                    {['S', 'M', 'L', 'XL'].map((s) => (
                      <span key={s} className="px-2 py-0.5 border border-zinc-200 rounded-md text-[9px] font-medium text-zinc-600">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center border border-zinc-200 rounded-lg">
                    <button className="px-2 py-1 text-zinc-500 text-sm">-</button>
                    <span className="px-2 py-1 text-sm font-semibold">১</span>
                    <button className="px-2 py-1 text-zinc-500 text-sm">+</button>
                  </div>
                  <button className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold py-1.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-colors">
                    কার্টে যোগ
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-3 mt-2 border border-red-100">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">কার্ট</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm">👕</span>
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold text-zinc-700">টি-শার্ট</p>
                    <p className="text-[9px] text-zinc-400">x২</p>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-800">৳৫০০</span>
                </div>
                <div className="border-t border-zinc-100 pt-1.5 mt-1 flex justify-between text-xs font-bold">
                  <span>মোট</span>
                  <span>৳৫০০</span>
                </div>
                <button className="w-full mt-2 bg-zinc-900 text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
                  অর্ডার করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[13px] bg-gradient-to-b from-zinc-200 to-zinc-300 mx-[8px] rounded-b" style={{ clipPath: 'polygon(2% 0, 98% 0, 100% 100%, 0 100%)' }} />
      <div className="h-[5px] w-[35%] bg-zinc-300 mx-auto rounded-b-md" />
    </div>
  );
}