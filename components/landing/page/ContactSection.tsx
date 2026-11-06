"use client";

import { FaPhoneAlt, FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

interface ContactItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  note: string;
  href: string;
  color: string;
}

interface ContactSectionProps {
  displayPhone: string;
  displayPhone2: string;
  displayEmail: string;
  displayAddress: string;
  displaySocialLinks: any;
  whatsappNumber: string;
  primary: string;
}

export default function ContactSection({ displayPhone, displayPhone2, displayEmail, displayAddress, displaySocialLinks, whatsappNumber, primary }: ContactSectionProps) {
  const items: ContactItem[] = [
    { icon: <FaPhoneAlt />, label: "ফোন করুন", value: displayPhone, sub: displayPhone2, note: "সকাল ৮টা – রাত ১০টা", href: `tel:${displayPhone}`, color: primary },
    { icon: <FaWhatsapp />, label: "WhatsApp", value: displaySocialLinks.whatsapp || displayPhone, note: "২৪/৭ গ্রাহক সাপোর্ট", href: `https://wa.me/${whatsappNumber}`, color: "#FBFCF8" },
    ...(displayEmail ? [{ icon: <FaEnvelope />, label: "ইমেইল", value: displayEmail, note: "আমাদের ইমেইল করুন", href: `mailto:${displayEmail}`, color: "#2563eb" }] : displayAddress ? [{ icon: <FaMapMarkerAlt />, label: "ঠিকানা", value: displayAddress, note: "", href: "#", color: "#dc2626" }] : []),
  ];

  return (
    <div className="bg-white border border-gray-200 p-5 rounded-sm">
      <h2 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2"><span className="w-3 h-3 inline-block rounded-sm" style={{ background: primary }} />আমাদের সাথে কথা বলুন</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((c, i) => (
          <a key={i} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined} className="flex items-start gap-3 p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all rounded-sm">
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-white text-sm rounded-sm" style={{ background: c.color }}>{c.icon}</div>
            <div className="min-w-0">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-0.5">{c.label}</div>
              <div className="font-black text-gray-800 text-sm truncate">{c.value}</div>
              {c.sub && <div className="text-xs text-gray-500 mt-0.5">{c.sub}</div>}
              <div className="text-[10px] text-gray-400 mt-0.5">{c.note}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}