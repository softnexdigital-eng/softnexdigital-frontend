import FullEcommerceMockup from './FullEcommerceMockup';

export default function SinglePageExperience() {
  return (
    <section className="py-20 px-4 sm:px-8 bg-red-50/40 border-y border-red-100">
      <div className="max-w-8xl mx-auto text-center w-full">
        <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3">এক পেজ শপ</p>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-3">
          এক পেজেই সম্পূর্ণ <span className="text-red-600">ই-কমার্স অভিজ্ঞতা</span>
        </h2>
        <p className="text-sm text-zinc-500 mb-10 max-w-2xl mx-auto">
          সিঙ্গেল প্রোডাক্ট হোক বা মাল্টি-প্রোডাক্ট – সব ধরনের পণ্যের জন্য ভ্যারিয়েন্ট, কার্ট, অর্ডার সবকিছু এক পেজে।
        </p>
        <div className="max-w-4xl mx-auto">
          <FullEcommerceMockup />
        </div>
      </div>
    </section>
  );
}