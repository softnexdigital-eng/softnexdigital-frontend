import Reveal from './Reveal';
import SnapCarousel from './SnapCarousel';

const FEATURES = [
  { title: 'ফেক অর্ডার ডিটেকশন', desc: 'কাস্টমার ভেরিফিকেশন ও ফ্রড স্কোর — সন্দেহজনক অর্ডার আগেই ধরা পড়ে, এক ক্লিকে ব্লক।' },
  { title: 'কুরিয়ার ইন্টিগ্রেশন', desc: 'Merchant Account থাকলে API Key যোগ করলেই যেকোনো কুরিয়ার সংযুক্ত।' },
  { title: 'অর্ডার ম্যানেজমেন্ট', desc: 'সব অর্ডার, ডেলিভারি ও স্ট্যাটাস এক ড্যাশবোর্ডে। Excel লাগবে না।' },
  { title: 'অটো ইনভেন্টরি', desc: 'অর্ডার হলেই স্টক আপডেট। হিসাবে আর গোলমাল হবে না।' },
  { title: 'সেলস অ্যানালিটিক্স', desc: 'বিক্রি, আয় ও সেরা প্রোডাক্ট এক নজরে, রিয়েল-টাইমে।' },
];

export default function Features() {
  return (
    <section id="features" className="bg-zinc-950 px-4 py-10 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="landing-section-title mb-7 max-w-xl font-black text-white sm:mb-12">
          ব্যবসা চালানোর জন্য যা যা দরকার, সবই আছে
        </h2>

        <SnapCarousel className="md:grid md:grid-cols-2 lg:grid-cols-3">
          <Reveal direction="left" delay={0} className="lg:row-span-2">
            <div className="h-full rounded-3xl bg-gradient-to-br from-red-600 to-red-700 p-5 sm:p-9 lg:flex lg:flex-col lg:justify-end">
              <p className="text-6xl font-black leading-none text-white sm:text-8xl">৩০</p>
              <p className="mt-1 text-2xl font-black text-white">মিনিটে লাইভ</p>
              <p className="mt-4 text-base leading-relaxed text-white/85">
                রেজিস্ট্রেশন করুন, প্রোডাক্ট দিন, অর্ডার নেওয়া শুরু করুন। কোডিং বা ডেভেলপার — কিছুই লাগবে না।
              </p>
            </div>
          </Reveal>

          {FEATURES.map((f, index) => (
            <Reveal key={f.title} direction={index % 2 === 0 ? "right" : "left"} delay={80 + index * 65}>
              <div className="h-full rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
                <h3 className="text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">{f.desc}</p>
              </div>
            </Reveal>
          ))}

          <Reveal direction="right" delay={430} className="sm:col-span-2 lg:col-span-1">
            <div className="h-full rounded-3xl border border-red-900/50 bg-red-950/40 p-5 sm:p-6">
              <h3 className="text-lg font-bold text-white">২৪ ঘণ্টা বাংলায় সাপোর্ট</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-zinc-300">সমস্যা হলে যেকোনো সময় WhatsApp-এ মেসেজ করুন।</p>
            </div>
          </Reveal>
        </SnapCarousel>
      </div>
    </section>
  );
}
