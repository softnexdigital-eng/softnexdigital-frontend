import SnapCarousel from './SnapCarousel';

// শুধু আসল ক্রেতার মন্তব্য বসান। খালি থাকলে সেকশনটি দেখা যাবে না।
const TESTIMONIALS: { quote: string; name: string; shop: string }[] = [
  // { quote: 'আসল মন্তব্য...', name: 'ক্রেতার নাম', shop: 'শপের নাম, শহর' },
];

export default function Testimonials() {
  if (!TESTIMONIALS.length) return null;

  return (
    <section className="bg-white px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-center text-[26px] font-black text-zinc-900 sm:mb-12 sm:text-4xl">তারাই বলছেন সত্যিটা</h2>
        <SnapCarousel className="md:grid md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-3xl bg-zinc-50 p-6">
              <blockquote className="text-base leading-relaxed text-zinc-700">“{t.quote}”</blockquote>
              <figcaption className="mt-5">
                <p className="font-bold text-zinc-900">{t.name}</p>
                <p className="text-sm text-zinc-500">{t.shop}</p>
              </figcaption>
            </figure>
          ))}
        </SnapCarousel>
      </div>
    </section>
  );
}
