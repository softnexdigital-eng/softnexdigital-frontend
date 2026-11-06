'use client';

import Link from 'next/link';
import { FiArrowRight, FiStar } from 'react-icons/fi';
import Hero3D from './Hero3D';
import DashboardMockup from './DashboardMockup';
import { HERO_BADGES, WHATSAPP_NUMBER, FaWhatsapp } from './constants';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-50/60 px-4 sm:px-8 lg:px-16">
      {/* Hologram background type */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <p
          className="font-black text-center leading-[0.85] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-red-300/25 via-red-300/15 to-transparent blur-[2px]"
          style={{ fontSize: 'clamp(4.5rem, 16vw, 13rem)' }}
        >
          SOFTNEX
          <br />
          COMMERCE OS
        </p>
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <Hero3D />
      </div>

      <div className="relative z-10 w-full max-w-8xl mx-auto flex flex-col lg:flex-row items-center gap-12 py-16">
        {/* Left */}
        <div className="flex-1 max-w-[580px] text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-red-50/90 backdrop-blur-sm border border-red-100 text-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            বাংলার ছোট ব্যবসার স্মার্ট Growth Engine
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.2] text-zinc-900 mb-4">
            বিক্রি বাড়ান, ঝামেলা কমান।
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">
              মাত্র ৯৯৯ টাকা থেকে
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-700 font-semibold mb-3">
            Landing Page · Order Management · Fraud Detection · Customer Analytics · WhatsApp Commerce
          </p>
          <p className="text-sm sm:text-base text-zinc-500 leading-relaxed mb-7 max-w-lg mx-auto lg:mx-0">
            Single Product, Multi Product, Order Management, Inventory, Fraud Customer Detection, Wishlist, Coupon, Analytics এবং Admin Dashboard — সবকিছু এক প্যাকেজে।
          </p>

          {/* Mini feature badges (glassmorphism) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-7 max-w-md mx-auto lg:mx-0">
            {HERO_BADGES.map((item, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-md border border-red-100 rounded-2xl px-3 py-2.5 flex items-center gap-2.5 shadow-sm">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${item.bg} ${item.clr}`}>
                  <item.icon size={15} />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-[11px] font-bold text-zinc-700">{item.title}</p>
                  <p className="text-[10px] text-zinc-400">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-7">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-7 py-3.5 rounded-2xl text-sm font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30 active:scale-[0.98]"
            >
              🚀 Start Selling <FiArrowRight size={16} />
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-7 py-3.5 rounded-2xl text-sm font-bold hover:bg-[#20bd5a] transition-all shadow-lg shadow-red-500/25 active:scale-[0.98]"
            >
              <FaWhatsapp size={16} /> 📺 Watch Demo
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 justify-center lg:justify-start">
            <div className="flex -space-x-2.5">
              {['#f97316', '#ef4444', '#3b82f6', '#10b981'].map((c, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: c }}
                >
                  {['র', 'ন', 'আ', 'ম'][i]}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-zinc-700">5000+ ব্যবসায়ী আমাদের সাথে যুক্ত</p>
              <div className="flex items-center gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar key={i} size={10} className="text-red-400 fill-red-400" />
                ))}
                <span className="text-[11px] text-zinc-500 ml-1">4.9/5 (1200+ Reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — device mockup */}
        <div className="relative flex-1 w-full max-w-[500px] mx-auto">
          <div className="relative">
            <div className="bg-gradient-to-b from-zinc-200 via-zinc-100 to-zinc-200 rounded-[18px] p-[3px] shadow-2xl shadow-red-200/40">
              <div className="bg-zinc-900 rounded-[15px] pt-3 px-1.5 pb-1.5 relative">
                <span className="absolute top-[6px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <div className="bg-white rounded-[8px] overflow-hidden h-[230px] sm:h-[260px]">
                  <DashboardMockup size="sm" />
                </div>
              </div>
            </div>
            <div className="h-[13px] bg-gradient-to-b from-zinc-200 to-zinc-300 mx-[8px] rounded-b" style={{ clipPath: 'polygon(2% 0, 98% 0, 100% 100%, 0 100%)' }} />
            <div className="h-[5px] w-[35%] bg-zinc-300 mx-auto rounded-b-md" />
          </div>

          {/* Mobile overlay */}
          <div className="absolute -bottom-4 -right-1 sm:right-2 w-[108px] sm:w-[124px]">
            <div className="bg-zinc-900 rounded-[28px] p-[5px] shadow-2xl shadow-red-300/25">
              <div className="bg-zinc-950 rounded-[23px] overflow-hidden relative h-[214px] sm:h-[244px]">
                <span className="absolute top-[5px] left-1/2 -translate-x-1/2 w-9 h-2.5 bg-zinc-900 rounded-full z-20" />
                <div className="bg-white h-full overflow-hidden">
                  <div className="bg-zinc-900 text-white text-[7px] font-bold px-2.5 pt-2.5 pb-1.5">YOUR BRAND</div>
                  <div className="bg-gradient-to-br from-red-500 to-red-600 h-14 flex flex-col items-start justify-center px-2.5 text-white">
                    <p className="text-[7px] font-black leading-tight">New Collection</p>
                    <p className="text-[6.5px] leading-tight opacity-90">Summer 2024</p>
                    <p className="text-[6px] mt-0.5 opacity-80">Get 20% Off</p>
                    <span className="mt-1 bg-white text-red-600 text-[5px] font-black rounded-full px-2 py-[1.5px]">Shop Now</span>
                  </div>
                  <div className="p-2">
                    <p className="text-[5.5px] font-bold text-zinc-400 mb-1.5">Featured Products</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['👕', '🎧'].map((emoji, i) => (
                        <div key={i} className="bg-zinc-50 border border-zinc-100 rounded-lg p-1">
                          <div className="bg-zinc-100 rounded h-8 mb-1 flex items-center justify-center text-[13px]">{emoji}</div>
                          <div className="h-[2.5px] w-6 bg-zinc-200 rounded-full mb-1" />
                          <div className="h-[2.5px] w-4 bg-red-300 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-7 h-[2.5px] bg-zinc-600 rounded-full" />
              </div>
            </div>
          </div>

          {/* Floating glass cards */}
          <div className="absolute -top-3 -left-2 sm:left-0 bg-white/85 backdrop-blur-md border border-red-100 rounded-2xl px-3 py-2 shadow-lg shadow-red-100/60">
            <p className="text-[10px] font-black text-zinc-800">🎯 Fraud Detected!</p>
            <p className="text-[9px] text-red-500 font-semibold">Customer blocked automatically</p>
          </div>

          <div className="hidden sm:block absolute top-1/3 -left-10 bg-white/85 backdrop-blur-md border border-red-100 rounded-2xl px-3 py-2 shadow-lg shadow-red-100/50">
            <p className="text-[10px] font-black text-zinc-800">+12 Orders Today</p>
          </div>

          <div className="hidden sm:block absolute top-[58%] -left-6 bg-white/85 backdrop-blur-md border border-red-100 rounded-2xl px-3 py-2 shadow-lg shadow-red-100/50">
            <p className="text-[10px] font-black text-zinc-800">৳12,500 Revenue</p>
          </div>

          <div className="hidden sm:block absolute -bottom-6 left-1/4 bg-white/85 backdrop-blur-md border border-red-100 rounded-2xl px-3 py-2 shadow-lg shadow-red-100/50">
            <p className="text-[10px] font-black text-zinc-800">⭐ 4.9 Customer Rating</p>
          </div>
        </div>
      </div>
    </section>
  );
}