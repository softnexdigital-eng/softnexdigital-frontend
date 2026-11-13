import Link from 'next/link';
import Reveal from './Reveal';
import SnapCarousel from './SnapCarousel';

const STEPS = [
  { title: 'একাউন্ট খুলুন', desc: 'নাম ও মোবাইল নম্বর দিয়ে রেজিস্ট্রেশন করুন। এক মিনিটেই হয়ে যায়।' },
  { title: 'প্রোডাক্ট সাজান', desc: 'ছবি, দাম ও ভ্যারিয়েন্ট যোগ করুন, আপনার মতো ডিজাইন বেছে নিন।' },
  { title: 'বিক্রি শুরু করুন', desc: 'লিংক শেয়ার করুন। অর্ডার, স্টক ও ডেলিভারি সিস্টেম নিজেই সামলাবে।' },
];

export default function Steps() {
  return (
    <section id="steps" className="bg-white px-4 py-10 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="landing-section-title mb-7 text-center font-black text-zinc-900 sm:mb-12">মাত্র ৩ ধাপে শপ চালু করুন</h2>

        <SnapCarousel role="list" className="md:grid md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} role="listitem">
              <Reveal direction="left" delay={i * 100}>
                <article className="relative h-full overflow-hidden rounded-3xl bg-zinc-50 p-5 sm:p-8">
                  <span className="absolute -right-2 -top-4 text-8xl font-black text-red-100" aria-hidden>
                    {i + 1}
                  </span>
                  <h3 className="relative text-xl font-bold text-zinc-900">{s.title}</h3>
                  <p className="relative mt-2 text-base leading-relaxed text-zinc-600">{s.desc}</p>
                </article>
              </Reveal>
            </div>
          ))}
        </SnapCarousel>

        <div className="mt-8 text-center">
          <Link href="/auth/login" className="inline-flex h-[52px] w-full items-center justify-center rounded-2xl bg-red-600 px-8 text-base font-bold text-white hover:bg-red-700 sm:h-14 sm:w-auto">
            এখনই শুরু করুন
          </Link>
        </div>
      </div>
    </section>
  );
}
