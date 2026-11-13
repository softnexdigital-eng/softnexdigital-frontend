// শুধু সেই ফিচারগুলোই রাখুন যেগুলো সত্যিই আপনার সিস্টেমে আছে
const ITEMS = [
  'কুরিয়ার API ইন্টিগ্রেশন',
  'ফেক অর্ডার ডিটেকশন',
  'অটো ইনভেন্টরি',
  'রিয়েল-টাইম অ্যানালিটিক্স',
  'ওয়ান-ক্লিক কাস্টমার ব্লক',
  'ভ্যারিয়েন্ট ও কার্ট',
];

export default function TrustStrip() {
  return (
    <section className="border-y border-zinc-100 bg-white py-5">
      <ul className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 sm:flex-wrap sm:justify-center sm:gap-3 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ITEMS.map((t) => (
          <li key={t} className="shrink-0 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">
            {t}
          </li>
        ))}
      </ul>
    </section>
  );
}
