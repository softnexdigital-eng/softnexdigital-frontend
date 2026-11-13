import Reveal from './Reveal';

const ROWS = [
  ['কার্টে Order Complete করে না', 'অটো অর্ডার প্রসেসিং ও ডেলিভারি'],
  ['Fake Order আসে', 'কাস্টমার ভেরিফিকেশন ও ফ্রড স্কোর'],
  ['একই ফ্রড কাস্টমার বারবার অর্ডার করে', 'এক ক্লিকে কাস্টমার ব্লক'],
  ['Excel Sheet দিয়ে অর্ডার ম্যানেজ করতে হয়', 'স্মার্ট ড্যাশবোর্ড — সব এক জায়গায়'],
  ['Stock হিসাব গোলমাল হয়ে যায়', 'অটোমেটিক ইনভেন্টরি ট্র্যাকিং'],
  ['Facebook Inbox থেকে অর্ডার ট্র্যাক করা কঠিন', 'রিয়েল-টাইম সেলস অ্যানালিটিক্স'],
];

export default function Comparison() {
  return (
    <section id="why" className="bg-zinc-50 px-4 py-10 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="landing-section-title mb-7 text-center font-black text-zinc-900 sm:mb-12">
          কেন আমাদের সিস্টেম নিবেন?
        </h2>

        <div className="hidden grid-cols-2 gap-4 px-6 pb-3 text-sm font-bold sm:grid">
          <p className="text-zinc-500">এখন যে সমস্যা</p>
          <p className="text-red-600">আমাদের সমাধান</p>
        </div>

        <ul className="space-y-3">
          {ROWS.map(([problem, solution]) => (
            <li key={problem} className="grid overflow-hidden rounded-2xl border border-zinc-200 bg-white sm:grid-cols-2">
              <Reveal direction="left">
                <p className="h-full px-4 py-3.5 text-[15px] leading-snug text-zinc-500 line-through decoration-zinc-300 sm:px-5 sm:py-4 sm:text-base">
                  {problem}
                </p>
              </Reveal>
              <Reveal direction="right" delay={80}>
                <p className="h-full border-t border-red-100 bg-red-50 px-4 py-3.5 text-[15px] font-semibold leading-snug text-zinc-900 sm:border-l sm:border-t-0 sm:px-5 sm:py-4 sm:text-base">
                  {solution}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
