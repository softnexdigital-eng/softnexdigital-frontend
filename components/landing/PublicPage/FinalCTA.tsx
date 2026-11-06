import { FiPhone } from 'react-icons/fi';
import { WHATSAPP_NUMBER, PHONE_DISPLAY, FaWhatsapp, FaFacebookMessenger } from './constants';

export default function FinalCTA() {
  return (
    <section className="relative py-24 px-4 sm:px-8 overflow-hidden bg-gradient-to-br from-red-600 via-red-600 to-red-700">
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5">
          🚀 আজই শুরু করুন
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white mb-4 leading-tight">
          আপনার ব্যবসা কি পরবর্তী লেভেলে নিতে প্রস্তুত?
        </h2>
        <p className="text-sm sm:text-base text-white/85 mb-9 max-w-lg mx-auto leading-relaxed">
          মাত্র ৩০ মিনিটে প্রফেশনাল রেডি Smart E-commerce Sales System আপনার হাতে।
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-white text-red-600 px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-zinc-100 transition-all shadow-lg w-full sm:w-auto justify-center"
          >
            🚀 Start Now
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-white/80 text-xs">
          <span className="inline-flex items-center gap-1.5"><FaWhatsapp size={14} /> {PHONE_DISPLAY}</span>
          <span className="inline-flex items-center gap-1.5"><FaFacebookMessenger size={14} /> m.me/softnexdigital</span>
        </div>
      </div>
    </section>
  );
}