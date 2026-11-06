'use client';

import { FiHeadphones, FiCode, FiZap, FiUserPlus } from 'react-icons/fi';
import Hero3D from './Hero3D';
import DashboardMockup from './DashboardMockup';
import { FaWhatsapp } from './constants';

const WHATSAPP_NUMBER = '8801918647966';

const HERO_BADGES = [
  { icon: FiHeadphones, title: '২৪ ঘণ্টা সাপোর্ট', sub: 'সবসময় পাশে', bg: 'bg-red-50', clr: 'text-red-500' },
  { icon: FiCode, title: 'কোডিং দরকার নেই', sub: 'রেডি সিস্টেম', bg: 'bg-blue-50', clr: 'text-blue-500' },
  { icon: FiZap, title: '৩০ মিনিটে লাইভ', sub: 'কুইক সেটআপ', bg: 'bg-amber-50', clr: 'text-amber-500' },
];

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-50/60 px-4 sm:px-8 lg:px-16">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Hero3D />
      </div>

      <div className="relative z-10 w-full max-w-8xl mx-auto flex flex-col lg:flex-row items-center gap-12 py-16">
        {/* Left */}
        <div className="flex-1 max-w-[580px] text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.2] text-zinc-900 mb-4">
            বিক্রি বাড়ান, ঝামেলা কমান।
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">
              মাত্র ২৫০ টাকা থেকে
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-500 leading-relaxed mb-7 max-w-lg mx-auto lg:mx-0">
            Landing Page, Order Management, Inventory, Fraud Detection ও Admin Dashboard — সবকিছু এক প্যাকেজে।
          </p>
          <p className="text-sm font-bold text-red-600 mb-6">মাসিক ২৫০ টাকা</p>

          {/* Feature badges */}
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
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Registration করতে চাই')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-7 py-3.5 rounded-2xl text-sm font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30 active:scale-[0.98]"
            >
              <FiUserPlus size={16} /> Registration
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-7 py-3.5 rounded-2xl text-sm font-bold hover:bg-[#20bd5a] transition-all shadow-lg shadow-green-500/25 active:scale-[0.98]"
            >
              <FaWhatsapp size={16} /> WhatsApp-এ যোগাযোগ
            </a>
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
                  <div className="bg-gradient-to-br from-red-500 to-red-600 h-14" />
                  <div className="p-2">
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
        </div>
      </div>
    </section>
  );
}