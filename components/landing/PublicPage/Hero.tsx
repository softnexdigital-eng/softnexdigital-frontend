'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardMockup from './DashboardMockup';
import { WHATSAPP_NUMBER } from './constants';

// TODO: নিজের মূল ডোমেইন বসান (শপের সাবডোমেইন প্রিভিউর জন্য)
const ROOT_DOMAIN = 'yourdomain.com';

const TRUST = ['২৪ ঘণ্টা সাপোর্ট', 'কোডিং লাগবে না', '৩০ মিনিটে লাইভ'];

export default function Hero() {
  const router = useRouter();
  const [shop, setShop] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = shop.toLowerCase().replace(/[^a-z0-9-]/g, '');
    router.push(slug ? `/auth/login?shop=${slug}` : '/auth/login');
  };

  return (
    <section
      id="home"
      className="relative min-h-[calc(100svh-var(--nav-h)-var(--dock-h))] overflow-hidden bg-white"
    >
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-10 pb-16 sm:gap-10 sm:px-8 sm:py-20 sm:pb-24 lg:grid-cols-2 lg:gap-8">
        <div className="text-center lg:text-left">
          <h1 className="landing-hero-title hero-enter hero-enter-1 font-black text-zinc-900">
            বিক্রি বাড়ান, ঝামেলা কমান।
            <span className="mt-2 block text-red-600">মাত্র ২৫০ টাকা থেকে</span>
          </h1>

          <p className="hero-enter hero-enter-2 mx-auto mt-5 max-w-md text-base leading-relaxed text-zinc-600 sm:text-lg lg:mx-0">
            Landing Page, Order Management, Inventory, Fraud Detection ও Admin Dashboard — সবকিছু এক প্যাকেজে।
          </p>

          <form onSubmit={onSubmit} className="hero-enter hero-enter-3 mx-auto mt-8 flex max-w-md flex-col gap-3 lg:mx-0">
            <div className="flex h-[52px] items-center overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm focus-within:border-red-400 focus-within:ring-4 focus-within:ring-red-100 sm:h-14">
              <input
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                placeholder="আপনার শপের নাম (ইংরেজিতে)"
                autoCapitalize="none"
                autoCorrect="off"
                aria-label="শপের নাম"
                className="h-full min-w-0 flex-1 bg-transparent px-4 text-base text-zinc-900 outline-none placeholder:text-zinc-400"
              />
              <span className="shrink-0 pr-4 text-sm text-zinc-400">.{ROOT_DOMAIN}</span>
            </div>
            <button
              type="submit"
              className="h-[52px] rounded-2xl bg-red-600 text-base font-bold text-white shadow-lg shadow-red-600/25 transition active:scale-[0.98] hover:bg-red-700 sm:h-14"
            >
              রেজিস্ট্রেশন করুন
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center text-base font-semibold text-zinc-700 hover:text-green-600"
            >
              WhatsApp-এ কথা বলুন
            </a>
          </form>

          <p className="hero-enter hero-enter-3 mt-2 text-sm text-zinc-500">
            {TRUST.join(' · ')}
          </p>
        </div>

        {/* Device mockup */}
        <div className="hero-enter hero-enter-4 relative mx-auto w-full max-w-[500px]">
          <div className="hero-float relative">
            <div className="hero-mockup-glow" aria-hidden="true" />
            <div className="rounded-[18px] bg-gradient-to-b from-zinc-200 via-zinc-100 to-zinc-200 p-[3px] shadow-2xl shadow-red-200/40">
              <div className="relative rounded-[15px] bg-zinc-900 px-1.5 pb-1.5 pt-3">
                <span className="absolute left-1/2 top-[6px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-zinc-700" />
                <div className="h-[210px] overflow-hidden rounded-[8px] bg-white sm:h-[260px]">
                  <DashboardMockup size="sm" />
                </div>
              </div>
            </div>
            <div
              className="mx-[8px] h-[13px] rounded-b bg-gradient-to-b from-zinc-200 to-zinc-300"
              style={{ clipPath: 'polygon(2% 0, 98% 0, 100% 100%, 0 100%)' }}
            />

            {/* ফোন মকআপ — মোবাইলে লুকানো */}
            <div className="absolute -bottom-4 right-2 hidden w-[124px] lg:block">
              <div className="rounded-[28px] bg-zinc-900 p-[5px] shadow-2xl shadow-red-300/25">
                <div className="relative h-[244px] overflow-hidden rounded-[23px] bg-white">
                  <div className="bg-zinc-900 px-2.5 pb-1.5 pt-3 text-[7px] font-bold text-white">YOUR BRAND</div>
                  <div className="h-14 bg-gradient-to-br from-red-500 to-red-600" />
                  <div className="grid grid-cols-2 gap-1.5 p-2">
                    {['👕', '🎧'].map((emoji) => (
                      <div key={emoji} className="rounded-lg border border-zinc-100 bg-zinc-50 p-1">
                        <div className="mb-1 flex h-8 items-center justify-center rounded bg-zinc-100 text-[13px]">{emoji}</div>
                        <div className="mb-1 h-[2.5px] w-6 rounded-full bg-zinc-200" />
                        <div className="h-[2.5px] w-4 rounded-full bg-red-300" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-zinc-400 md:flex">
        <span>SCROLL TO EXPLORE</span>
        <span className="hero-scroll-line" aria-hidden="true" />
      </div>
    </section>
  );
}
