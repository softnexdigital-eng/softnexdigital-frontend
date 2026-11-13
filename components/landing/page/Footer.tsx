"use client";

import {
  FaFacebook,
  FaYoutube,
  FaInstagram,
  FaAngleRight,
  FaShieldAlt,
  FaTruck,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";

interface FooterProps {
  displayLogo: string | null;
  companyName: string;
  displayPhone: string;
  displayPhone2: string;
  displayEmail: string;
  displayAddress: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  displaySocialLinks: any;
  termsContent: string;
  showTerms: boolean;
  setShowTerms: (v: boolean) => void;
  primary: string;
  primaryDark: string;
}

function ColTitle({ children, primary }: { children: React.ReactNode; primary: string }) {
  return (
    <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
      <span className="inline-block h-4 w-1 rounded-full" style={{ background: primary }} />
      {children}
    </h4>
  );
}

export default function Footer({
  displayLogo,
  companyName,
  displayPhone,
  displayPhone2,
  displayEmail,
  displayAddress,
  displaySocialLinks,
  termsContent,
  setShowTerms,
  primary,
}: FooterProps) {
  const quickLinks = [
    { l: "হোম", h: "#" },
    { l: "আমাদের সম্পর্কে", h: "#" },
    { l: "সব পণ্য", h: "#order-form" },
    { l: "যোগাযোগ", h: `tel:${displayPhone}` },
  ];

  const supportLinks = [
    { l: "ডেলিভারি তথ্য", h: "#" },
    { l: "পেমেন্ট পদ্ধতি", h: "#" },
    { l: "রিটার্ন ও রিফান্ড", h: "#" },
    ...(termsContent ? [{ l: "শর্তাবলী", h: "#terms" }] : []),
    { l: "সাহায্য কেন্দ্র", h: `tel:${displayPhone}` },
  ];

  const social = [
    { key: "facebook", icon: <FaFacebook />, href: displaySocialLinks?.facebook, label: "Facebook" },
    { key: "youtube", icon: <FaYoutube />, href: displaySocialLinks?.youtube, label: "YouTube" },
    { key: "instagram", icon: <FaInstagram />, href: displaySocialLinks?.instagram, label: "Instagram" },
  ].filter((s) => s.href);

  const linkCls =
    "group flex min-h-[32px] items-center gap-1 text-sm text-white/65 transition-colors hover:text-white";

  return (
    <footer
      className="mt-8 px-4 pt-12 sm:px-8"
      style={{ background: "#111827", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-[1790px]">
        <div className="mb-10 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 space-y-4 lg:col-span-1">
            <div className="flex items-center gap-3">
              {displayLogo ? (
                <img
                  src={displayLogo}
                  alt={companyName || "Logo"}
                  className="h-12 w-auto max-w-[160px] rounded-lg bg-white/10 object-contain p-1.5"
                />
              ) : (
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold text-white"
                  style={{ background: primary }}
                >
                  {companyName?.charAt(0) || "S"}
                </div>
              )}
              <div className="text-base font-bold text-white">{companyName}</div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/65">
              আমরা বাংলাদেশের সেরা মানের পণ্য সরাসরি আপনার দরজায় পৌঁছে দিই।
            </p>
            {social.length > 0 && (
              <div className="flex gap-2.5 pt-1">
                {social.map((s) => (
                  <a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg text-white transition-colors hover:bg-white hover:text-gray-900"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div>
            <ColTitle primary={primary}>দ্রুত লিঙ্ক</ColTitle>
            <ul className="space-y-1.5">
              {quickLinks.map((l, i) => (
                <li key={i}>
                  <a href={l.h} className={linkCls}>
                    <FaAngleRight className="text-[10px] opacity-40 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                    {l.l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <ColTitle primary={primary}>সহায়তা</ColTitle>
            <ul className="space-y-1.5">
              {supportLinks.map((l, i) => (
                <li key={i}>
                  <a
                    href={l.h}
                    onClick={
                      l.h === "#terms"
                        ? (e) => {
                            e.preventDefault();
                            setShowTerms(true);
                          }
                        : undefined
                    }
                    className={linkCls}
                  >
                    <FaAngleRight className="text-[10px] opacity-40 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                    {l.l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 lg:col-span-1">
            <ColTitle primary={primary}>যোগাযোগ করুন</ColTitle>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs text-white">
                  <FaPhoneAlt />
                </span>
                <div className="min-w-0">
                  <a href={`tel:${displayPhone}`} className="block py-0.5 text-sm font-medium text-white/85 hover:text-white">
                    {displayPhone}
                  </a>
                  {displayPhone2 && (
                    <a href={`tel:${displayPhone2}`} className="block py-0.5 text-sm font-medium text-white/85 hover:text-white">
                      {displayPhone2}
                    </a>
                  )}
                </div>
              </li>
              {displayEmail && (
                <li className="flex items-center gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs text-white">
                    <FaEnvelope />
                  </span>
                  <a href={`mailto:${displayEmail}`} className="break-all text-sm font-medium text-white/85 hover:text-white">
                    {displayEmail}
                  </a>
                </li>
              )}
              {displayAddress && (
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs text-white">
                    <FaMapMarkerAlt />
                  </span>
                  <span className="text-sm leading-relaxed text-white/65">{displayAddress}</span>
                </li>
              )}
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs text-white">
                  <FaClock />
                </span>
                <span className="text-sm leading-relaxed text-white/65">
                  শনিবার - বৃহস্পতিবার (সকাল ৯টা - রাত ৮টা)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 lg:flex-row">
          <div className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:gap-4 sm:text-left">
            <span className="text-xs text-white/50 sm:text-sm">
              © {new Date().getFullYear()} {companyName}. সর্বস্বত্ব সংরক্ষিত।
            </span>
            <span className="hidden text-white/20 sm:inline">|</span>
            <span className="text-xs text-white/50 sm:text-sm">
              Developed by{" "}
              <a
                href="https://www.facebook.com/profile.php?id=100089008002232"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Softnex Digital
              </a>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-white/60">
              <FaShieldAlt style={{ color: primary }} /> নিরাপদ পেমেন্ট
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-white/60">
              <FaTruck style={{ color: primary }} /> দ্রুত ডেলিভারি
            </span>
            {["bKash", "Nagad", "VISA", "MC"].map((b) => (
              <span key={b} className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold tracking-wider text-white/65">
                {b}
              </span>
            ))}
            {termsContent && (
              <button
                onClick={() => setShowTerms(true)}
                className="ml-1 py-1 text-xs text-white/45 underline underline-offset-2 transition-colors hover:text-white"
              >
                Terms &amp; Conditions
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
