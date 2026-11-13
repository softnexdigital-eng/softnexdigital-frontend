// উত্তরগুলো আপনার সিস্টেম অনুযায়ী মিলিয়ে নিন
const FAQS = [
  { q: 'ব্যবহার করতে কি কোডিং জানা লাগবে?', a: 'না। এটা রেডি সিস্টেম — রেজিস্ট্রেশন করে প্রোডাক্ট যোগ করলেই ৩০ মিনিটের মধ্যে শপ লাইভ।' },
  { q: 'কুরিয়ার সার্ভিস কীভাবে যুক্ত করব?', a: 'কুরিয়ারের Merchant Account থাকলে শুধু API Key যোগ করুন, বাকিটা সিস্টেম করবে।' },
  { q: 'ফেক অর্ডার কীভাবে আটকাবো?', a: 'কাস্টমার ভেরিফিকেশন ও ফ্রড স্কোর দেখে এক ক্লিকে কাস্টমার ব্লক করতে পারবেন।' },
  { q: 'সমস্যা হলে সাপোর্ট কোথায় পাব?', a: '২৪ ঘণ্টা সাপোর্ট আছে। WhatsApp-এ মেসেজ করলেই আমরা সাহায্য করব।' },
];

export default function FAQ() {
  return (
    <section id="faq" className="bg-white px-4 py-10 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="landing-section-title mb-7 text-center font-black text-zinc-900 sm:mb-12">মনে প্রশ্ন আছে?</h2>
        <div className="divide-y divide-zinc-200 rounded-3xl border border-zinc-200">
          {FAQS.map((f) => (
            <details key={f.q} className="group px-4 py-4 sm:px-6 sm:py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-zinc-900 sm:text-lg [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-2xl font-light text-red-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-base leading-relaxed text-zinc-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
