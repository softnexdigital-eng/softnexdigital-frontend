"use client";

import { 
  FaFacebook, 
  FaYoutube, 
  FaInstagram, 
  FaAngleRight, 
  FaShieldAlt, 
  FaTruck, 
  FaLeaf, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaCode,
  FaClock,
  FaGlobe
} from "react-icons/fa";

interface FooterProps {
  displayLogo: string | null;
  companyName: string;
  displayPhone: string;
  displayPhone2: string;
  displayEmail: string;
  displayAddress: string;
  displaySocialLinks: any;
  termsContent: string;
  showTerms: boolean;
  setShowTerms: (v: boolean) => void;
  primary: string;
  primaryDark: string;
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
  showTerms, 
  setShowTerms, 
  primary, 
  primaryDark 
}: FooterProps) {
  return (
    <>
      <footer 
        className="text-white pt-14 pb-0 px-4 sm:px-8 mt-8"
        style={{ background: `linear-gradient(165deg, #111827 0%, #1F2937 50%, #111827 100%)` }}
      >
        <div className="max-w-[1790px] mx-auto">
          {/* Main Grid Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            
            {/* Column 1: Brand Profile */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {displayLogo ? (
                  <img src={displayLogo} alt="Logo" className="h-12 w-auto object-contain bg-white/10 p-1.5 backdrop-blur-sm" style={{ borderRadius: "10px" }} />
                ) : (
                  <div className="w-12 h-12 bg-white/10 flex items-center justify-center backdrop-blur-sm" style={{ borderRadius: "10px" }}>
                    <FaLeaf className="text-white text-xl" />
                  </div>
                )}
                <div>
                  <div className="font-extrabold text-white text-base tracking-wide">{companyName}</div>
                  <div className="text-xs text-white/60 font-medium mt-0.5">PREMIUM SHOPPING</div>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed font-normal">
                আমরা বাংলাদেশের সেরা মানের পণ্য সরাসরি আপনার দরজায় পৌঁছে দিই।
              </p>
              <div className="flex gap-3 pt-2">
                {displaySocialLinks.facebook && (
                  <a href={displaySocialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 flex items-center justify-center hover:bg-white text-primaryDark hover:text-orange-600 transition-all duration-300  group" style={{ borderRadius: "10px" }}>
                    <FaFacebook className="text-lg text-white group-hover:text-[#1877F2] transition-colors" />
                  </a>
                )}
                {displaySocialLinks.youtube && (
                  <a href={displaySocialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 flex items-center justify-center hover:bg-white transition-all duration-300  group" style={{ borderRadius: "10px" }}>
                    <FaYoutube className="text-lg text-white group-hover:text-red-600 transition-colors" />
                  </a>
                )}
                {displaySocialLinks.instagram && (
                  <a href={displaySocialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 flex items-center justify-center hover:bg-white transition-all duration-300  group" style={{ borderRadius: "10px" }}>
                    <FaInstagram className="text-lg text-white group-hover:text-pink-600 transition-colors" />
                  </a>
                )}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-1.5 h-4 inline-block" style={{ background: primary, borderRadius: "4px" }} />
                দ্রুত লিঙ্ক
              </h4>
              <ul className="space-y-3">
                {[{l:"হোম",h:"#"},{l:"আমাদের সম্পর্কে",h:"#"},{l:"সব পণ্য",h:"#order-form"},{l:"যোগাযোগ",h:`tel:${displayPhone}`}].map((l,i) => (
                  <li key={i}>
                    <a href={l.h} className="text-white/70 hover:text-white text-sm transition-all duration-200 flex items-center gap-1 group">
                      <FaAngleRight className="text-orange-500 translate-x-[-4px] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-xs" />
                      <span className="group-hover:translate-x-1 transition-transform">{l.l}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Customer Support */}
            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-1.5 h-4 inline-block" style={{ background: primary, borderRadius: "4px" }} />
                সহায়তা
              </h4>
              <ul className="space-y-3">
                {[{l:"ডেলিভারি তথ্য",h:"#"},{l:"পেমেন্ট পদ্ধতি",h:"#"},{l:"রিটার্ন ও রিফান্ড",h:"#"},...(termsContent?[{l:"শর্তাবলী",h:"#terms"}]:[]),{l:"সাহায্য কেন্দ্র",h:`tel:${displayPhone}`}].map((l,i) => (
                  <li key={i}>
                    <a 
                      href={l.h} 
                      onClick={l.h==="#terms" ? (e)=>{e.preventDefault(); setShowTerms(true);} : undefined} 
                      className="text-white/70 hover:text-white text-sm transition-all duration-200 flex items-center gap-1 group"
                    >
                      <FaAngleRight className="text-orange-500 translate-x-[-4px] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-xs" />
                      <span className="group-hover:translate-x-1 transition-transform">{l.l}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact Info */}
            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-1.5 h-4 inline-block" style={{ background: primary, borderRadius: "4px" }} />
                যোগাযোগ করুন
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ borderRadius: "8px" }}>
                    <FaPhoneAlt className="text-white text-xs" />
                  </div>
                  <div>
                    <a href={`tel:${displayPhone}`} className="text-white/80 hover:text-white text-sm block font-medium">{displayPhone}</a>
                    {displayPhone2 && <a href={`tel:${displayPhone2}`} className="text-white/80 hover:text-white text-sm block font-medium mt-0.5">{displayPhone2}</a>}
                  </div>
                </li>
                {displayEmail && (
                  <li className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-white/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: "8px" }}>
                      <FaEnvelope className="text-white text-xs" />
                    </div>
                    <a href={`mailto:${displayEmail}`} className="text-white/80 hover:text-white text-sm break-all font-medium">{displayEmail}</a>
                  </li>
                )}
                {displayAddress && (
                  <li className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ borderRadius: "8px" }}>
                      <FaMapMarkerAlt className="text-white text-xs" />
                    </div>
                    <span className="text-white/70 text-sm leading-relaxed">{displayAddress}</span>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ borderRadius: "8px" }}>
                    <FaClock className="text-white text-xs" />
                  </div>
                  <span className="text-white/70 text-sm">শনিবার - বৃহস্পতিবার (সকাল ৯টা - রাত ৮টা)</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Developer Info */}
          <div className="border-t border-[#1F2937] py-6 flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Copyright & Softnex branding combined perfectly */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <span className="text-white/50 text-sm">
                © {new Date().getFullYear()} {companyName}. সর্বস্বত্ব সংরক্ষিত।
              </span>
              <span className="hidden sm:inline text-white/20">|</span>
              <span className="text-white/60 text-sm flex items-center gap-1.5 bg-white/5 px-3 py-1 backdrop-blur-sm border border-white/5" style={{ borderRadius: "8px" }}>
                <FaCode className="text-orange-500 text-xs animate-pulse" /> Developed by 
                <a 
                  href="https://www.facebook.com/profile.php?id=100089008002232" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white hover:text-orange-400 font-bold transition-all duration-200 hover:underline underline-offset-4 flex items-center gap-1"
                >
                  Softnex Digital
                  <FaGlobe className="text-[10px] text-white/50" />
                </a>
              </span>
            </div>
            
            {/* Trust Badges & Badges */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <span className="flex items-center gap-1.5 text-white/50 text-xs bg-white/5 px-2.5 py-1" style={{ borderRadius: "8px" }}>
                <FaShieldAlt className="text-orange-500 text-xs" /> নিরাপদ পেমেন্ট
              </span>
              <span className="flex items-center gap-1.5 text-white/50 text-xs bg-white/5 px-2.5 py-1" style={{ borderRadius: "8px" }}>
                <FaTruck className="text-orange-500 text-xs" /> দ্রুত ডেলিভারি
              </span>
              <div className="flex gap-1.5">
                {["bKash", "Nagad", "VISA", "MC"].map(b => (
                  <span key={b} className="bg-white/8 text-white/60 text-[10px] font-bold px-2 py-0.5 tracking-wider" style={{ borderRadius: "6px" }}>
                    {b}
                  </span>
                ))}
              </div>
              {termsContent && (
                <button 
                  onClick={() => setShowTerms(true)} 
                  className="text-white/40 hover:text-orange-400 text-xs transition-colors ml-1 underline underline-offset-2"
                >
                  Terms & Conditions
                </button>
              )}
            </div>

          </div>
        </div>
      </footer>
    </>
  );
}