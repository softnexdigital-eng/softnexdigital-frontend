import Link from 'next/link';
import { WHATSAPP_NUMBER, PHONE_DISPLAY } from './constants';

export default function FinalCTA() {
  return (
    <section className="bg-red-600 px-4 py-12 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="landing-section-title font-black text-white">
          আপনার ব্যবসা পরবর্তী লেভেলে নিতে প্রস্তুত?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/90 sm:text-lg">
          মাত্র ৩০ মিনিটে প্রফেশনাল Smart E-commerce Sales System আপনার হাতে।
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            href="/auth/login"
            className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-white px-10 text-base font-bold text-red-600 shadow-lg transition hover:bg-zinc-100 sm:h-14 sm:w-auto"
          >
            রেজিস্ট্রেশন করুন
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-white underline underline-offset-4"
          >
            WhatsApp: {PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </section>
  );
}
