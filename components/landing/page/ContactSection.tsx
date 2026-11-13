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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  displaySocialLinks: any;
  whatsappNumber: string;
  primary: string;
}

export default function ContactSection({
  displayPhone,
  displayPhone2,
  displayEmail,
  displayAddress,
  displaySocialLinks,
  whatsappNumber,
  primary,
}: ContactSectionProps) {
  const items: ContactItem[] = [
    {
      icon: <FaPhoneAlt />,
      label: "ফোন করুন",
      value: displayPhone,
      sub: displayPhone2,
      note: "সকাল ৮টা – রাত ১০টা",
      href: `tel:${displayPhone}`,
      color: primary,
    },
    {
      icon: <FaWhatsapp />,
      label: "WhatsApp",
      value: displaySocialLinks?.whatsapp || displayPhone,
      note: "২৪/৭ গ্রাহক সাপোর্ট",
      href: `https://wa.me/${whatsappNumber}`,
      color: "#25D366",
    },
    ...(displayEmail
      ? [
          {
            icon: <FaEnvelope />,
            label: "ইমেইল",
            value: displayEmail,
            note: "আমাদের ইমেইল করুন",
            href: `mailto:${displayEmail}`,
            color: "#2563EB",
          },
        ]
      : displayAddress
        ? [
            {
              icon: <FaMapMarkerAlt />,
              label: "ঠিকানা",
              value: displayAddress,
              note: "",
              href: "#",
              color: "#DC2626",
            },
          ]
        : []),
  ];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 flex items-center gap-2.5 text-base font-bold text-gray-900 sm:text-lg">
        <span className="inline-block h-5 w-1 rounded-full" style={{ background: primary }} />
        আমাদের সাথে কথা বলুন
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map((c, i) => {
          const external = c.href.startsWith("http");
          return (
            <a
              key={i}
              href={c.href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="group flex items-center gap-3.5 rounded-xl border border-gray-100 p-4 transition-all hover:border-gray-200 hover:shadow-sm active:scale-[0.99]"
            >
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-base"
                style={{ background: `${c.color}15`, color: c.color }}
              >
                {c.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{c.label}</div>
                <div className="truncate text-sm font-bold text-gray-900">{c.value}</div>
                {c.sub && <div className="mt-0.5 truncate text-xs text-gray-500">{c.sub}</div>}
                {c.note && <div className="mt-0.5 text-[11px] text-gray-400">{c.note}</div>}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
