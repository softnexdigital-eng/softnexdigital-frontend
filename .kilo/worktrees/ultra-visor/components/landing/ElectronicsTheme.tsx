"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ThemeConfig } from "@/app/[slug]/themeConfig";
import { Variant } from "@/types";
import VideoEmbed from "./VideoEmbed";
import {
  FaWhatsapp, FaPhoneAlt, FaFacebook, FaInstagram, FaYoutube,
  FaShoppingCart, FaMapMarkerAlt, FaEnvelope, FaShieldAlt,
  FaTruck, FaStar, FaCheckCircle,
  FaChevronDown, FaBolt, FaCogs, FaHeadset, FaUndo,
  FaBox, FaTimes, FaPlay, FaLeaf, FaBatteryFull,
  FaWind, FaChevronUp, FaChevronLeft, FaChevronRight,
  FaLock, FaMinus, FaPlus, FaBars, FaHeart, FaRegHeart,
  FaTag, FaCheck, FaShippingFast,
} from "react-icons/fa";
import { MdElectricBolt, MdVerified } from "react-icons/md";
import { GiSmartphone } from "react-icons/gi";

import { Review } from "@/types";

interface TechLayoutProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  theme: ThemeConfig;
  variants: Variant[];
  selectedVariant: Variant | null;
  quantity: number;
  whatsappNumber: string;
  productImage: string | null;
  allImages: string[];
  displayLogo: string | null;
  displayPhone: string;
  displayPhone2: string;
  displayEmail: string;
  displayAddress: string;
  displaySocialLinks: {[key: string]: string};
  termsContent: string;
  companyName: string;
  isFreeDelivery: boolean;
  deliveryCharge: number;
  orderSuccess: { orderNumber: string } | null;
  orderLoading: boolean;
  showTerms: boolean;
  galleryIndex: number;
  openFaq: number | null;
  reviewIndex: number;
  isScrolled: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleSubmit: any;
  setSelectedVariant: (v: Variant | null) => void;
  setQuantity: (n: number) => void;
  setOrderSuccess: (v: { orderNumber: string } | null) => void;
  setShowTerms: (v: boolean) => void;
  setGalleryIndex: (v: number) => void;
  setOpenFaq: (v: number | null) => void;
  setReviewIndex: (v: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmitOrder: (data: any) => void;
  videoUrl?: string;
  reviews?: Review[];
  reviewsLoading?: boolean;
  showReviewForm?: boolean;
  editingReviewId?: string | null;
  reviewName?: string;
  reviewLocation?: string;
  reviewText?: string;
  reviewStars?: number;
  reviewPhone?: string;
  reviewSubmitting?: boolean;
  setShowReviewForm?: (v: boolean) => void;
  setEditingReviewId?: (v: string | null) => void;
  setReviewName?: (v: string) => void;
  setReviewLocation?: (v: string) => void;
  setReviewText?: (v: string) => void;
  setReviewStars?: (v: number) => void;
  setReviewPhone?: (v: string) => void;
  onReviewSubmit?: () => void;
  onEditReview?: (r: Review) => void;
  onDeleteReview?: (id: string) => void;
}

/* ─── colour tokens ─────────────────────────────────── */
const C = {
  pageBg:    "#f5f5f5",
  white:     "#ffffff",
  blue:      "#1a56db",
  blueDark:  "#1340a8",
  blueLight: "#e8f1ff",
  textDark:  "#111827",
  textMid:   "#374151",
  textGray:  "#6b7280",
  textLight: "#9ca3af",
  red:     "#25D366",
  redBg:   "#ecfdf5",
  redText: "#059669",
  star:      "#f50b0b",
  red:       "#ef4444",
  divider:   "#e5e7eb",
  navBg:     "#ffffff",
  footerBg:  "#0f172a",
  trustBg:   "#ffffff",
  cardBg:    "#ffffff",
  tabActive: "#1a56db",
};

/* ─── Attribute icon resolver ────────────────────────── */
function getAttrIcon(key: string, value: string) {
  const k = key.toLowerCase(); const v = String(value).toLowerCase();
  if (/rpm|speed|motor|power/i.test(k) || /rpm|watt/i.test(v)) return <FaBolt />;
  if (/speed|wind|fan|airflow/i.test(k) || /speed|wind/i.test(v)) return <FaWind />;
  if (/charge|type.?c|usb|cable|volt/i.test(k) || /type.?c|usb|fast charge/i.test(v)) return <MdElectricBolt />;
  if (/battery|mah|hour|life|backup/i.test(k) || /hour|mah|battery/i.test(v)) return <FaBatteryFull />;
  if (/weight|gram|g\b|light|ounce/i.test(k) || /g\b|gram|lightweight/i.test(v)) return <FaLeaf />;
  if (/size|compact|pocket|dimension/i.test(k) || /compact|pocket|mini/i.test(v)) return <FaBox />;
  if (/color|shade/i.test(k)) return <GiSmartphone />;
  return <FaCogs />;
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function TechLayout({
  data, theme, variants = [], selectedVariant, quantity, whatsappNumber,
  productImage, allImages = [], displayLogo, displayPhone, displayPhone2,
  displayEmail, displayAddress, displaySocialLinks, termsContent,
  companyName, isFreeDelivery, deliveryCharge, orderSuccess, orderLoading,
  showTerms, galleryIndex, openFaq, reviewIndex, isScrolled,
  errors, register, handleSubmit,
  setSelectedVariant, setQuantity, setOrderSuccess, setShowTerms,
  setGalleryIndex, setOpenFaq, setReviewIndex, onSubmitOrder, videoUrl,
  reviews: reviewsProp,
  reviewsLoading,
  showReviewForm,
  editingReviewId,
  reviewName,
  reviewLocation,
  reviewText,
  reviewStars,
  reviewPhone,
  reviewSubmitting,
  setShowReviewForm,
  setEditingReviewId,
  setReviewName,
  setReviewLocation,
  setReviewText,
  setReviewStars,
  setReviewPhone,
  onReviewSubmit,
  onEditReview,
  onDeleteReview,
}: TechLayoutProps) {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews" | "faq">("specs");
  const [variantSlide, setVariantSlide] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [variantDropdownOpen, setVariantDropdownOpen] = useState(false);
  const orderRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Close dropdown on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setVariantDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Cart count is simply the current quantity if a variant is selected */
  const cartCount = selectedVariant ? quantity : 0;

  useEffect(() => { const t = setTimeout(() => setLoading(false), 1200); return () => clearTimeout(t); }, []);

  /* Sync variantSlide with selectedVariant prop — FIX #2 */
  useEffect(() => {
    if (selectedVariant && variants.length > 0) {
      const index = variants.findIndex(v => v.id === selectedVariant.id);
      if (index !== -1) {
        setVariantSlide(index);
      }
    }
  }, [selectedVariant, variants]);

  const productName = data?.product?.name || "প্রোডাক্ট";
  const productDesc = data?.product?.description || "";

  /* spec items from selected variant */
  const specItems = useMemo(() => {
    const attrs = selectedVariant?.attributes;
    if (!attrs || !Object.keys(attrs).length) return [];
    return Object.entries(attrs).map(([key, value]) => ({
      icon: getAttrIcon(key, String(value)),
      label: String(value),
      sub: key,
    }));
  }, [selectedVariant]);

  /* variant color circles — extract first attr as color name */
  const variantColors: {[key: string]: string} = {
    black: "#1f2937", white: "#f9fafb", gold: "#06d937", pink: "#ec4899",
    blue: "#3b82f6", red: "#ef4444", red: "#22c55e", silver: "#9ca3af",
    gray: "#6b7280", purple: "#8b5cf6", red: "#f97316", red: "#eab308",
  };

  function getColorSwatch(attrVal: string) {
    const lower = String(attrVal).toLowerCase();
    for (const [key, hex] of Object.entries(variantColors)) {
      if (lower.includes(key)) return hex;
    }
    return C.blue;
  }

  const scrollToOrder = () => {
    setTimeout(() => orderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const inc = () => setQuantity(Math.min(selectedVariant?.stock ?? 99, quantity + 1));
  const dec = () => setQuantity(Math.max(1, quantity - 1));

  /* Reviews - use dynamic data from props, fallback to hardcoded if none */
  const reviews = (reviewsProp && reviewsProp.length > 0)
    ? reviewsProp.map(r => ({
        name: r.name,
        loc: r.location,
        text: r.text,
        stars: r.stars,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "",
        avatar: r.name.charAt(0),
      }))
    : [
        { name: "রাকিব হাসান",     loc: "ঢাকা",      text: "দারুণ একটি প্রোডাক্ট! বাতাস অনেক শক্তিশালী আর ব্যাটারি লাইফও অসাধারণ।", stars: 5, date: "20 May 2024", avatar: "র" },
        { name: "সাবিনা ইয়াসমিন", loc: "চট্টগ্রাম",  text: "খুবই কম্প্যাক্ট এবং পোর্টেবল। ট্রাভেলের জন্য বেস্ট একটা ফ্যান।",          stars: 5, date: "18 May 2024", avatar: "সা" },
        { name: "আরিফুল ইসলাম",    loc: "সিলেট",     text: "কোয়ালিটি অনেক ভালো। চার্জ অনেক দিন থাকে। সবাইকে রিকমেন্ড করবো।",         stars: 5, date: "15 May 2024", avatar: "আ" },
      ];

  /* FAQs */
  const faqs = [
    { q: "ডেলিভারি কতদিনে পাবো?",       a: "ঢাকার ভেতরে ১-২ কার্যদিবস, ঢাকার বাইরে ২-৩ কার্যদিবস।" },
    { q: "পেমেন্ট কীভাবে করবো?",         a: "ক্যাশ অন ডেলিভারি সারা দেশে পাওয়া যাচ্ছে।" },
    { q: "কি কি রঙে পাওয়া যাচ্ছে?",     a: "Black, White, Gold, Pink ও Blue রঙে পাওয়া যাচ্ছে।" },
    { q: "চার্জ দিতে কত সময় লাগে?",     a: "Type-C চার্জারে প্রায় ২ ঘণ্টায় ফুল চার্জ হয়।" },
    { q: "ওয়ারেন্টি আছে কি?",            a: "হ্যাঁ, ১০০% অরিজিনাল পণ্য সম্পূর্ণ ওয়ারেন্টি সহ।" },
  ];

  const navLinks = [
    { label: "হোম",     href: "#home" },
    { label: "শপ",      href: "#variants" },
    { label: "রিভিউ",   href: "#reviews" },
    { label: "FAQ",     href: "#faq" },
    { label: "যোগাযোগ", href: "#contact" },
  ];

  const VARIANTS_PER_PAGE = 5;
  const maxSlide = Math.max(0, variants.length - VARIANTS_PER_PAGE);

  /* ══════════ ORDER SUCCESS ══════════ */
  if (orderSuccess) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: C.pageBg, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ maxWidth: 420, width: "100%", background: C.white, borderRadius: "1.25rem", padding: "2.5rem", textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.blueLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
          <FaCheckCircle style={{ fontSize: "2.25rem", color: C.blue }} />
        </div>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: C.textDark, marginBottom: "0.5rem" }}>অর্ডার সফল!</h2>
        <p style={{ color: C.textGray, marginBottom: "1rem", fontSize: "0.9rem" }}>আপনার অর্ডার নম্বর</p>
        <div style={{ background: `linear-gradient(135deg,${C.blue},${C.blueDark})`, borderRadius: "0.875rem", padding: "1rem 2rem", marginBottom: "1.5rem", fontSize: "1.75rem", fontWeight: 800, color: "#fff" }}>
          {orderSuccess.orderNumber}
        </div>
        <p style={{ fontSize: "0.85rem", color: C.textGray, marginBottom: "1.5rem" }}>শীঘ্রই আমাদের টিম আপনার সাথে যোগাযোগ করবে। ধন্যবাদ! 🎉</p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <a href={`https://wa.me/${whatsappNumber}?text=আমার অর্ডার নম্বর: ${orderSuccess.orderNumber}`}
            target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: C.red, color: "#fff", fontWeight: 700, padding: "0.875rem", borderRadius: "0.75rem", textDecoration: "none", fontSize: "0.9rem" }}>
            <FaWhatsapp /> ট্র্যাক করুন
          </a>
          <button onClick={() => { setOrderSuccess(null); setQuantity(1); }}
            style={{ flex: 1, background: C.blueLight, color: C.blue, fontWeight: 700, padding: "0.875rem", borderRadius: "0.75rem", border: "none", cursor: "pointer", fontSize: "0.9rem" }}>
            নতুন অর্ডার
          </button>
        </div>
      </div>
    </div>
  );

  /* ══════════ SKELETON ══════════ */
  if (loading) return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`@keyframes sk{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ height: 60, background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", padding: "0 1.5rem", gap: "1rem" }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)", backgroundSize: "200% 100%", animation: "sk 1.4s infinite linear" }} />
        <div style={{ width: 120, height: 20, borderRadius: 4, background: "linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)", backgroundSize: "200% 100%", animation: "sk 1.4s infinite linear" }} />
      </div>
      <div style={{ maxWidth: 1600, margin: "2rem auto", padding: "0 1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ height: 60, borderRadius: 8, background: "linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)", backgroundSize: "200% 100%", animation: "sk 1.4s infinite linear" }} />
        ))}
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════
     FULL PAGE
  ══════════════════════════════════════════════════════ */
  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: C.pageBg, minHeight: "100vh", color: C.textDark }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:${C.blue};border-radius:3px}

        .btn-primary{
          background:${C.blue};color:#fff;border:none;border-radius:0.5rem;
          font-weight:700;cursor:pointer;transition:all .15s;display:inline-flex;
          align-items:center;justify-content:center;gap:0.5rem;font-family:inherit;
        }
        .btn-primary:hover{background:${C.blueDark}}
        .btn-primary:disabled{opacity:0.5;cursor:not-allowed}

        .btn-outline{
          background:#fff;color:${C.blue};border:1.5px solid ${C.blue};border-radius:0.5rem;
          font-weight:700;cursor:pointer;transition:all .15s;display:inline-flex;
          align-items:center;justify-content:center;gap:0.5rem;font-family:inherit;
        }
        .btn-outline:hover{background:${C.blueLight}}

        .nav-link{color:${C.textGray};font-size:0.875rem;text-decoration:none;font-weight:500;transition:color .15s}
        .nav-link:hover{color:${C.textDark}}

        .tab-btn{
          padding:0.75rem 1.25rem;font-size:0.875rem;font-weight:600;cursor:pointer;
          border:none;background:transparent;font-family:inherit;color:${C.textGray};
          border-bottom:2.5px solid transparent;transition:all .15s;
        }
        .tab-btn.active{color:${C.blue};border-bottom-color:${C.blue}}
        .tab-btn:hover{color:${C.textDark}}

        .variant-card{
          background:#fff;border:1.5px solid ${C.divider};border-radius:0.75rem;
          padding:0.75rem;cursor:pointer;transition:all .15s;text-align:left;
        }
        .variant-card:hover{border-color:${C.blue}}
        .variant-card.active{border-color:${C.blue};box-shadow:0 0 0 2px rgba(26,86,219,0.15)}

        .color-swatch{
          width:36px;height:36px;border-radius:50%;cursor:pointer;border:2.5px solid transparent;
          transition:all .15s;flex-shrink:0;
        }
        .color-swatch.active{border-color:${C.blue};box-shadow:0 0 0 2px rgba(26,86,219,0.25)}
        .color-swatch:hover{transform:scale(1.1)}

        .qty-btn{
          width:36px;height:36px;border-radius:0.375rem;border:1.5px solid ${C.divider};
          background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;
          font-size:0.8rem;color:${C.textDark};transition:all .15s;
        }
        .qty-btn:hover{border-color:${C.blue};color:${C.blue}}

        .faq-btn{
          width:100%;display:flex;align-items:center;justify-content:space-between;
          padding:1rem 1.25rem;background:#fff;border:none;cursor:pointer;
          font-family:inherit;font-size:0.875rem;font-weight:600;color:${C.textDark};
          text-align:left;gap:0.75rem;transition:background .15s;
        }
        .faq-btn:hover{background:#f9fafb}
        .faq-btn.open{background:#f9fafb}

        .img-arrow{
          position:absolute;top:50%;transform:translateY(-50%);
          width:36px;height:36px;border-radius:50%;background:#fff;
          border:1px solid ${C.divider};display:flex;align-items:center;justify-content:center;
          cursor:pointer;color:${C.textGray};font-size:0.8rem;
          box-shadow:0 2px 8px rgba(0,0,0,0.08);transition:all .15s;z-index:2;
        }
        .img-arrow:hover{border-color:${C.blue};color:${C.blue}}

        .thumb{
          width:70px;height:70px;border-radius:0.5rem;overflow:hidden;
          border:2px solid ${C.divider};cursor:pointer;flex-shrink:0;transition:border .15s;
        }
        .thumb.active{border-color:${C.blue}}
        .thumb:hover{border-color:${C.blue}}
        .thumb img{width:100%;height:100%;object-fit:cover}

        /* Responsive */
        @media(min-width:1024px){
          .product-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:2rem!important}
          .reviews-faq-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:2rem!important}
          .footer-grid{grid-template-columns:2fr 1fr 1fr 1.5fr!important}
          .trust-bar{grid-template-columns:repeat(4,1fr)!important}
          .desk-nav{display:flex!important}
          .mob-menu-btn{display:none!important}
          .bottom-bar{display:none!important}
        }
        @media(max-width:1023px){
          .product-grid{display:block!important}
          .product-grid > *:first-child{margin-bottom:1.5rem}
          .reviews-faq-grid{display:block!important}
          .reviews-section{margin-bottom:2rem}
          .footer-grid{grid-template-columns:1fr 1fr!important}
          .trust-bar{grid-template-columns:repeat(2,1fr)!important}
          .desk-nav{display:none!important}
          .bottom-bar{display:flex!important}
        }
        @media(max-width:600px){
          .trust-bar{grid-template-columns:repeat(2,1fr)!important}
        }
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeIn .35s ease both}
        @keyframes sk{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>

      {/* ═══════════ NAVBAR ═══════════ */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: C.white, borderBottom: `1px solid ${C.divider}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }}>
            {displayLogo
              ? <img src={displayLogo} alt="Logo" style={{ height: 34, objectFit: "contain" }} />
              : <div style={{ width: 36, height: 36, borderRadius: "0.5rem", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaWind style={{ color: "#fff", fontSize: "1rem" }} />
                </div>
            }
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.95rem", color: C.textDark, lineHeight: 1.1 }}>{companyName}</div>
              <div style={{ fontSize: "0.6rem", color: C.textGray, letterSpacing: "0.03em" }}>Premium Electronics</div>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="desk-nav" style={{ display: "flex", gap: "1.75rem", alignItems: "center" }}>
            {navLinks.map(n => (
              <a key={n.label} href={n.href} className="nav-link">{n.label}</a>
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", flexShrink: 0 }}>
            <a href={`tel:${displayPhone}`} className="desk-nav"
              style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: C.textGray, fontSize: "0.8rem", textDecoration: "none", fontWeight: 500 }}>
              <FaPhoneAlt style={{ fontSize: "0.7rem", color: C.blue }} /> {displayPhone}
            </a>
            <button className="btn-primary" style={{ padding: "0.5rem 1.125rem", fontSize: "0.8rem" }} onClick={scrollToOrder}>
              <FaShoppingCart style={{ fontSize: "0.75rem" }} />{cartCount > 0 ? ` কার্ট (${cartCount})` : " অর্ডার করুন"}
            </button>
            <button className="mob-menu-btn" onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.textDark, fontSize: "1.25rem", padding: "0.25rem" }}>
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: C.white, borderTop: `1px solid ${C.divider}`, padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {navLinks.map(n => (
              <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)}
                style={{ color: C.textGray, fontSize: "0.9rem", textDecoration: "none", padding: "0.25rem 0" }}>
                {n.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* ═══════════ BREADCRUMB ═══════════ */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.divider}` }}>
        <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0.5rem 1.5rem", display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8rem", color: C.textGray }}>
          <a href="#home" style={{ color: C.blue, textDecoration: "none" }}>হোম</a>
          <FaChevronRight style={{ fontSize: "0.55rem" }} />
          <a href="#" style={{ color: C.blue, textDecoration: "none" }}>পণ্যসমূহ</a>
          <FaChevronRight style={{ fontSize: "0.55rem" }} />
          <span style={{ color: C.textDark, fontWeight: 500 }}>{productName}</span>
        </div>
      </div>

      {/* ═══════════ PRODUCT SECTION ═══════════ */}
      <section id="home" style={{ background: C.white, padding: "1.5rem 0" }}>
        <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0 1.5rem" }}>
          <div className="product-grid fade-in">

            {/* ── LEFT: Image Gallery ── */}
            <div>
              {/* Main image */}
              <div style={{ position: "relative", borderRadius: "1rem", border: `1px solid ${C.divider}`, overflow: "hidden", background: "#fafafa", marginBottom: "0.875rem" }}>
                {/* NEW ARRIVAL badge */}
                <div style={{ position: "absolute", top: "0.875rem", left: "0.875rem", zIndex: 2 }}>
                  <span style={{ background: C.blue, color: "#fff", fontSize: "0.68rem", fontWeight: 800, padding: "0.25rem 0.75rem", borderRadius: "4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    NEW ARRIVAL
                  </span>
                </div>
                {/* Wishlist */}
                <button onClick={() => setWishlisted(!wishlisted)}
                  style={{ position: "absolute", top: "0.875rem", right: "0.875rem", zIndex: 2, width: 36, height: 36, borderRadius: "50%", background: "#fff", border: `1px solid ${C.divider}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: wishlisted ? "#ef4444" : C.textLight, fontSize: "0.95rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  {wishlisted ? <FaHeart /> : <FaRegHeart />}
                </button>

                {/* Prev arrow */}
                {allImages.length > 1 && (
                  <button className="img-arrow" style={{ left: "0.75rem" }}
                    onClick={() => setGalleryIndex(Math.max(0, galleryIndex - 1))}>
                    <FaChevronLeft />
                  </button>
                )}

                {videoUrl
                  ? <VideoEmbed videoUrl={videoUrl} />
                  : (allImages[galleryIndex] || productImage)
                    ? <img src={allImages[galleryIndex] || productImage!} alt={productName}
                        style={{ width: "100%", aspectRatio: "1/1", objectFit: "contain", display: "block", maxHeight: 400 }} />
                    : <div style={{ aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", maxHeight: 400 }}>
                        <FaWind style={{ fontSize: "5rem", color: "#d1d5db" }} />
                      </div>
                }

                {/* Next arrow */}
                {allImages.length > 1 && (
                  <button className="img-arrow" style={{ right: "0.75rem" }}
                    onClick={() => setGalleryIndex(Math.min(allImages.length - 1, galleryIndex + 1))}>
                    <FaChevronRight />
                  </button>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {allImages.slice(0, 6).map((img, i) => (
                    <div key={i} className={`thumb${galleryIndex === i ? " active" : ""}`}
                      onClick={() => setGalleryIndex(i)}>
                      <img src={img} alt="" />
                    </div>
                  ))}
                   <p style={{ fontSize: "0.875rem", color: C.textGray, lineHeight: 1.75, marginBottom: "1.25rem" }}>
                {productDesc}
              </p> 
                </div>
               
             
              )}

              {/* Feature chips row */}
              {specItems.length > 0 && (
                <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", marginTop: "1.25rem" }}>
                  {specItems.slice(0, 4).map((f, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", background: "#f9fafb", border: `1px solid ${C.divider}`, borderRadius: "0.625rem", padding: "0.625rem 0.875rem", flex: 1, minWidth: 80 }}>
                      <span style={{ fontSize: "1.1rem", color: C.blue }}>{f.icon}</span>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: C.textDark, textAlign: "center", lineHeight: 1.3 }}>{f.label}</div>
                      <div style={{ fontSize: "0.62rem", color: C.textGray, textAlign: "center" }}>{f.sub}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            

            {/* ── RIGHT: Product Info + Order ── */}
            <div ref={orderRef}>
              {/* Title */}
              <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: C.textDark, lineHeight: 1.2, marginBottom: "0.625rem" }}>
                {productName}
              </h1>

              {/* Stars + rating */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.875rem" }}>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} style={{ color: C.star, fontSize: "0.875rem" }} />
                  ))}
                </div>
                <span style={{ fontSize: "0.82rem", color: C.textGray, fontWeight: 500 }}>4.8 (128 রিভিউ)</span>
                <span style={{ color: C.divider }}>|</span>
                <span style={{ fontSize: "0.82rem", color: C.textGray }}>২৫০+ বিক্রিত</span>
              </div>

              {/* Price */}
              <div style={{ marginBottom: "0.875rem" }}>
                <span style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 900, color: C.blue, letterSpacing: "-0.02em" }}>
                  ৳{selectedVariant ? selectedVariant.price.toFixed(0) : "—"}
                </span>
              </div>

             

              {/* Spec list — compact badge row */}
              {specItems.length > 0 && (
                <div style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                  {specItems.map((s, i) => (
                    <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: C.blueLight, borderRadius: "2rem", padding: "0.25rem 0.625rem", fontSize: "0.7rem", fontWeight: 600, color: C.blue, whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "0.65rem", flexShrink: 0 }}>{s.icon}</span>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Variant selector — compact pill-style */}
              {variants.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: C.textDark, marginBottom: "0.5rem" }}>
                    রঙ নির্বাচন করুন{selectedVariant ? `: ${Object.values(selectedVariant.attributes)[0] || ''}` : ''}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    {variants.map(v => {
                      const active = selectedVariant?.id === v.id;
                      const firstAttr = Object.values(v.attributes)[0] as string;
                      const swatch = getColorSwatch(firstAttr);
                      const outOfStock = v.stock <= 0;
                      return (
                        <div
                          key={v.id}
                          onClick={() => { if (!outOfStock) { setSelectedVariant(v); setQuantity(1); } }}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "0.375rem",
                            padding: "0.375rem 0.75rem", borderRadius: "2rem",
                            background: active ? C.blue : "#fff",
                            border: active ? `1.5px solid ${C.blue}` : `1.5px solid ${C.divider}`,
                            cursor: outOfStock ? "not-allowed" : "pointer",
                            opacity: outOfStock ? 0.4 : 1,
                            transition: "all .15s",
                            userSelect: "none",
                          }}
                        >
                          <span style={{
                            display: "inline-block",
                            width: 14, height: 14, borderRadius: "50%",
                            background: swatch,
                            border: swatch === "#f9fafb" || swatch === "#ffffff" ? "1px solid #d1d5db" : "none",
                            flexShrink: 0,
                          }} />
                          <span style={{
                            fontSize: "0.78rem",
                            fontWeight: active ? 700 : 500,
                            color: active ? "#fff" : C.textDark,
                          }}>
                            {firstAttr}
                          </span>
                          {outOfStock && (
                            <span style={{ fontSize: "0.6rem", color: C.red }}>স্টক শেষ</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity + stock */}
              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.25rem" }}>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: C.textDark }}>পরিমাণ</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <button className="qty-btn" onClick={dec}><FaMinus style={{ fontSize: "0.6rem" }} /></button>
                  <span style={{ minWidth: 36, textAlign: "center", fontWeight: 700, fontSize: "1rem" }}>{quantity}</span>
                  <button className="qty-btn" onClick={inc}><FaPlus style={{ fontSize: "0.6rem" }} /></button>
                </div>
                {selectedVariant && selectedVariant.stock > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: C.redBg, color: C.redText, fontSize: "0.78rem", fontWeight: 600, padding: "0.35rem 0.75rem", borderRadius: "2rem" }}>
                    <FaCheck style={{ fontSize: "0.6rem" }} />
                    স্টকে আছে ({selectedVariant.stock > 200 ? "200+" : selectedVariant.stock} টি)
                  </div>
                )}
              </div>

              {/* ═══════════ ORDER FORM ═══════════ */}
              <form onSubmit={handleSubmit(onSubmitOrder)} style={{ marginBottom: "1.25rem" }}>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: C.textDark, marginBottom: "0.75rem" }}>অর্ডার ফর্ম</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {/* Variant selector dropdown with image */}
                  {variants.length > 1 && (
                    <div ref={dropdownRef} style={{ position: "relative" }}>
                      <div
                        onClick={() => setVariantDropdownOpen(!variantDropdownOpen)}
                        style={{
                          display: "flex", alignItems: "center", gap: "0.625rem",
                          width: "100%", padding: "0.625rem 0.875rem",
                          borderRadius: "0.5rem",
                          border: `1.5px solid ${selectedVariant ? C.blue : C.divider}`,
                          fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit",
                          background: "#fff", boxSizing: "border-box",
                          transition: "border .15s",
                        }}
                      >
                        {selectedVariant ? (
                          <>
                            {(selectedVariant as Variant & { image?: string }).image || productImage ? (
                              <img
                                src={(selectedVariant as Variant & { image?: string }).image || productImage!}
                                alt="" style={{ width: 28, height: 28, borderRadius: "0.375rem", objectFit: "cover", flexShrink: 0 }}
                              />
                            ) : (
                              <span style={{ width: 28, height: 28, borderRadius: "0.375rem", background: getColorSwatch(Object.values(selectedVariant.attributes)[0] as string), flexShrink: 0 }} />
                            )}
                            <span style={{ flex: 1, fontWeight: 600, color: C.textDark }}>
                              {Object.values(selectedVariant.attributes)[0] as string}
                            </span>
                            <span style={{ fontWeight: 800, color: C.blue, fontSize: "0.85rem" }}>৳{selectedVariant.price.toFixed(0)}</span>
                            <FaChevronDown style={{ fontSize: "0.65rem", color: C.textGray, flexShrink: 0, transform: variantDropdownOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }} />
                          </>
                        ) : (
                          <>
                            <span style={{ flex: 1, color: C.textGray }}>ভেরিয়েন্ট সিলেক্ট করুন *</span>
                            <FaChevronDown style={{ fontSize: "0.65rem", color: C.textGray, flexShrink: 0 }} />
                          </>
                        )}
                      </div>

                      {variantDropdownOpen && (
                        <div style={{
                          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20,
                          marginTop: "0.25rem", background: "#fff",
                          borderRadius: "0.5rem", border: `1px solid ${C.divider}`,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                          maxHeight: 240, overflowY: "auto",
                        }}>
                          {variants.map(v => {
                            const isActive = selectedVariant?.id === v.id;
                            const attrVal = Object.values(v.attributes)[0] as string;
                            const img = (v as Variant & { image?: string }).image || productImage;
                            return (
                              <div key={v.id} onClick={() => { setSelectedVariant(v); setQuantity(1); setVariantDropdownOpen(false); }}
                                style={{
                                  display: "flex", alignItems: "center", gap: "0.625rem",
                                  padding: "0.625rem 0.875rem", cursor: v.stock <= 0 ? "not-allowed" : "pointer",
                                  background: isActive ? C.blueLight : "#fff",
                                  opacity: v.stock <= 0 ? 0.4 : 1,
                                  borderBottom: `1px solid ${C.divider}`,
                                  transition: "background .1s",
                                }}
                                onMouseEnter={e => { if (v.stock > 0 && !isActive) (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
                                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "#fff"; }}
                              >
                                {img ? (
                                  <img src={img} alt="" style={{ width: 32, height: 32, borderRadius: "0.375rem", objectFit: "cover", flexShrink: 0 }} />
                                ) : (
                                  <span style={{ width: 32, height: 32, borderRadius: "0.375rem", background: getColorSwatch(attrVal), flexShrink: 0 }} />
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: C.textDark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{attrVal}</div>
                                  <div style={{ fontSize: "0.65rem", color: C.textGray }}>{v.stock <= 0 ? "স্টক শেষ" : `স্টক: ${v.stock > 200 ? "200+" : v.stock}`}</div>
                                </div>
                                <span style={{ fontWeight: 800, color: C.blue, fontSize: "0.85rem", flexShrink: 0 }}>৳{v.price.toFixed(0)}</span>
                                {isActive && <FaCheck style={{ color: C.blue, fontSize: "0.7rem", flexShrink: 0 }} />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Name */}
                  <div>
                    <input {...register("customerName", { required: "নাম দিন" })}
                      placeholder="আপনার নাম *"
                      style={{ width: "100%", padding: "0.75rem 0.875rem", borderRadius: "0.5rem", border: `1.5px solid ${C.divider}`, fontSize: "0.875rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                    {errors.customerName && <p style={{ fontSize: "0.75rem", color: C.red, marginTop: "0.25rem" }}>{errors.customerName.message}</p>}
                  </div>
                  {/* Phone */}
                  <div>
                    <input {...register("customerPhone", {
                      required: "ফোন নম্বর দিন",
                      pattern: { value: /^01[3-9]\d{8}$/, message: "সঠিক ফোন নম্বর দিন (01xxxxxxxxx)" }
                    })}
                      placeholder="ফোন নম্বর *"
                      style={{ width: "100%", padding: "0.75rem 0.875rem", borderRadius: "0.5rem", border: `1.5px solid ${C.divider}`, fontSize: "0.875rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                    {errors.customerPhone && <p style={{ fontSize: "0.75rem", color: C.red, marginTop: "0.25rem" }}>{errors.customerPhone.message}</p>}
                  </div>
                  {/* Address */}
                  <div>
                    <input {...register("customerAddress", { required: "ঠিকানা দিন" })}
                      placeholder="ঠিকানা *"
                      style={{ width: "100%", padding: "0.75rem 0.875rem", borderRadius: "0.5rem", border: `1.5px solid ${C.divider}`, fontSize: "0.875rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                    {errors.customerAddress && <p style={{ fontSize: "0.75rem", color: C.red, marginTop: "0.25rem" }}>{errors.customerAddress.message}</p>}
                  </div>
                  {/* Email */}
                  <div>
                    <input {...register("customerEmail")}
                      placeholder="ইমেইল (ঐচ্ছিক)"
                      type="email"
                      style={{ width: "100%", padding: "0.75rem 0.875rem", borderRadius: "0.5rem", border: `1.5px solid ${C.divider}`, fontSize: "0.875rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                  </div>
                  {/* Notes */}
                  <div>
                    <input {...register("notes")}
                      placeholder="নোট (ঐচ্ছিক)"
                      style={{ width: "100%", padding: "0.75rem 0.875rem", borderRadius: "0.5rem", border: `1.5px solid ${C.divider}`, fontSize: "0.875rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                  </div>
                  {/* Total price */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderTop: `1px solid ${C.divider}` }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: C.textDark }}>মোট</span>
                    <span style={{ fontSize: "1.25rem", fontWeight: 900, color: C.blue }}>
                      ৳{selectedVariant ? (selectedVariant.price * quantity + (isFreeDelivery ? 0 : deliveryCharge)).toFixed(0) : "—"}
                    </span>
                  </div>
                  {/* Submit */}
                  <button type="submit" className="btn-primary" disabled={orderLoading}
                    style={{ width: "100%", padding: "1rem", fontSize: "1rem" }}>
                    {orderLoading ? "প্রসেসিং..." : "অর্ডার কনফার্ম করুন"}
                  </button>
                </div>
              </form>

              {/* Mini trust */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.5rem", padding: "1rem 0", borderTop: `1px solid ${C.divider}` }}>
                {[
                  { icon: <FaShippingFast />, t: "ডেলিভারি ১-৩ দিন" },
                  { icon: <FaUndo />, t: "৭ দিনের রিটার্ন" },
                  { icon: <FaShieldAlt />, t: "১০০% অরিজিনাল পণ্য" },
                  { icon: <FaLock />, t: "সিকিউর পেমেন্ট" },
                ].map((b, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.375rem", textAlign: "center" }}>
                    <span style={{ color: C.blue, fontSize: "1.1rem" }}>{b.icon}</span>
                    <span style={{ fontSize: "0.62rem", color: C.textGray, lineHeight: 1.3 }}>{b.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ VARIANTS SECTION ═══════════ */}
      <section id="variants" style={{ background: C.white, borderTop: `1px solid ${C.divider}`, padding: "1.5rem 0" }}>
        <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0 1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: C.textDark, marginBottom: "1rem" }}>ভিরেন্ট সমূহ</h2>

          <div style={{ position: "relative" }}>
            {/* Prev */}
            {variantSlide > 0 && (
              <button onClick={() => setVariantSlide(Math.max(0, variantSlide - 1))}
                style={{ position: "absolute", left: -16, top: "50%", transform: "translateY(-50%)", zIndex: 3, width: 36, height: 36, borderRadius: "50%", background: "#fff", border: `1px solid ${C.divider}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", color: C.textGray }}>
                <FaChevronLeft style={{ fontSize: "0.75rem" }} />
              </button>
            )}

            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(variants.length, VARIANTS_PER_PAGE)}, 1fr)`, gap: "0.5rem", overflow: "hidden" }}>
              {variants.slice(variantSlide, variantSlide + VARIANTS_PER_PAGE).map(v => {
                const active = selectedVariant?.id === v.id;
                const thumb = (v as Variant & { image?: string }).image || productImage;
                const firstAttr = Object.values(v.attributes)[0] as string;
                const outOfStock = v.stock <= 0;
                return (
                  <div key={v.id} className={`variant-card${active ? " active" : ""}`}
                    onClick={() => { if (!outOfStock) { setSelectedVariant(v); setQuantity(1); } }}
                    style={{ opacity: outOfStock ? 0.45 : 1, cursor: outOfStock ? "not-allowed" : "pointer", padding: "0.5rem" }}>
                    {thumb && (
                      <div style={{ borderRadius: "0.375rem", overflow: "hidden", background: "#f9fafb", aspectRatio: "1/1", marginBottom: "0.375rem" }}>
                        <img src={thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      </div>
                    )}
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: C.textDark, marginBottom: "0.125rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{firstAttr}</div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 800, color: C.blue }}>৳{v.price.toFixed(0)}</div>
                    <div style={{ fontSize: "0.62rem", color: outOfStock ? C.red : C.redText, fontWeight: 600 }}>
                      {outOfStock ? "স্টক শেষ" : `স্টক ${v.stock > 200 ? "200+" : v.stock}`}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next */}
            {variantSlide < maxSlide && (
              <button onClick={() => setVariantSlide(Math.min(maxSlide, variantSlide + 1))}
                style={{ position: "absolute", right: -16, top: "50%", transform: "translateY(-50%)", zIndex: 3, width: 36, height: 36, borderRadius: "50%", background: "#fff", border: `1px solid ${C.divider}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", color: C.textGray }}>
                <FaChevronRight style={{ fontSize: "0.75rem" }} />
              </button>
            )}
          </div>

          {/* Dots */}
          {variants.length > VARIANTS_PER_PAGE && (
            <div style={{ display: "flex", justifyContent: "center", gap: "0.375rem", marginTop: "1rem" }}>
              {[...Array(Math.ceil(variants.length / VARIANTS_PER_PAGE))].map((_, i) => (
                <div key={i} onClick={() => setVariantSlide(i * VARIANTS_PER_PAGE)}
                  style={{ width: i * VARIANTS_PER_PAGE === variantSlide ? 20 : 8, height: 8, borderRadius: 4, background: i * VARIANTS_PER_PAGE === variantSlide ? C.blue : C.divider, cursor: "pointer", transition: "all .2s" }} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ TABS SECTION ═══════════ */}
      <section style={{ background: C.white, borderTop: `1px solid ${C.divider}`, marginBottom: "0" }}>
        <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0 1.5rem" }}>
          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: `1px solid ${C.divider}`, overflowX: "auto" }}>
            {([
              { key: "description", label: "বিবরণ" },
              { key: "specs", label: "স্পেসিফিকেশন" },
              { key: "reviews", label: `রিভিউ (128)` },
              { key: "faq", label: "FAQ" },
            ] as const).map(t => (
              <button key={t.key} className={`tab-btn${activeTab === t.key ? " active" : ""}`}
                onClick={() => setActiveTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding: "1.5rem 0" }}>
            {activeTab === "description" && (
              <p style={{ fontSize: "0.9rem", color: C.textGray, lineHeight: 1.8 }}>{productDesc || "পণ্যের বিবরণ পাওয়া যায়নি।"}</p>
            )}

            {activeTab === "specs" && specItems.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
                {/* Labels col */}
                <div>
                  {specItems.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderBottom: i < specItems.length - 1 ? `1px solid ${C.divider}` : "none", borderRight: `1px solid ${C.divider}` }}>
                      <span style={{ color: C.blue, fontSize: "0.875rem", flexShrink: 0 }}>{s.icon}</span>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: C.textDark }}>{s.sub}</span>
                    </div>
                  ))}
                </div>
                {/* Values col */}
                <div>
                  {specItems.map((s, i) => (
                    <div key={i} style={{ padding: "0.75rem 1rem", borderBottom: i < specItems.length - 1 ? `1px solid ${C.divider}` : "none", fontSize: "0.875rem", color: C.textGray }}>
                      {s.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {reviews.map((r, i) => (
                  <div key={i} style={{ padding: "1rem", borderRadius: "0.75rem", border: `1px solid ${C.divider}`, background: "#fafafa" }}>
                    <div style={{ display: "flex", gap: "2px", marginBottom: "0.5rem" }}>
                      {[...Array(r.stars)].map((_, s) => <FaStar key={s} style={{ color: C.star, fontSize: "0.8rem" }} />)}
                    </div>
                    <p style={{ fontSize: "0.875rem", color: C.textGray, lineHeight: 1.65, marginBottom: "0.75rem" }}>{r.text}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{r.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.82rem", color: C.textDark }}>{r.name}</div>
                        <div style={{ fontSize: "0.7rem", color: C.textLight }}>{r.date}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "faq" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {faqs.map((f, i) => (
                  <div key={i} style={{ borderRadius: "0.625rem", overflow: "hidden", border: `1px solid ${C.divider}` }}>
                    <button className={`faq-btn${openFaq === i ? " open" : ""}`}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      <span>{f.q}</span>
                      <FaChevronDown style={{ fontSize: "0.72rem", color: openFaq === i ? C.blue : C.textLight, transform: openFaq === i ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", flexShrink: 0 }} />
                    </button>
                    {openFaq === i && (
                      <div style={{ padding: "0.75rem 1.25rem 1rem", fontSize: "0.875rem", color: C.textGray, lineHeight: 1.7, borderTop: `1px solid ${C.divider}`, background: "#fafafa" }}>
                        {f.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════ REVIEWS + FAQ SIDE BY SIDE ═══════════ */}
      <section style={{ background: C.pageBg, padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: 1600, margin: "0 auto" }}>
          <div className="reviews-faq-grid">

            {/* Reviews */}
            <div className="reviews-section" id="reviews">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: C.textDark }}>গ্রাহকদের মতামত</h2>
                <a href="#" style={{ fontSize: "0.8rem", color: C.blue, textDecoration: "none", fontWeight: 600 }}>সব দেখুন</a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {reviews.map((r, i) => (
                  <div key={i} style={{ background: C.white, borderRadius: "0.75rem", padding: "1rem", border: `1px solid ${C.divider}` }}>
                    <div style={{ display: "flex", gap: "2px", marginBottom: "0.5rem" }}>
                      {[...Array(r.stars)].map((_, s) => <FaStar key={s} style={{ color: C.star, fontSize: "0.78rem" }} />)}
                    </div>
                    <p style={{ fontSize: "0.82rem", color: C.textGray, lineHeight: 1.65, marginBottom: "0.75rem" }}>{r.text}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{r.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.8rem", color: C.textDark }}>{r.name}</div>
                        <div style={{ fontSize: "0.68rem", color: C.textLight }}>{r.date}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div id="faq">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: C.textDark }}>সচরাচর জিজ্ঞাসা</h2>
                <a href="#" style={{ fontSize: "0.8rem", color: C.blue, textDecoration: "none", fontWeight: 600 }}>সব দেখুন</a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {faqs.map((f, i) => (
                  <div key={i} style={{ borderRadius: "0.625rem", overflow: "hidden", border: `1px solid ${C.divider}` }}>
                    <button className={`faq-btn${openFaq === 100 + i ? " open" : ""}`}
                      onClick={() => setOpenFaq(openFaq === 100 + i ? null : 100 + i)}>
                      <span>{f.q}</span>
                      <FaChevronDown style={{ fontSize: "0.72rem", color: openFaq === 100 + i ? C.blue : C.textLight, transform: openFaq === 100 + i ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", flexShrink: 0 }} />
                    </button>
                    {openFaq === 100 + i && (
                      <div style={{ padding: "0.75rem 1.25rem 1rem", fontSize: "0.875rem", color: C.textGray, lineHeight: 1.7, borderTop: `1px solid ${C.divider}`, background: "#fafafa" }}>
                        {f.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer id="contact" style={{ background: C.footerBg, color: "#fff", padding: "2.5rem 1.5rem 5rem" }}>
        <div style={{ maxWidth: 1600, margin: "0 auto" }}>
          <div className="footer-grid" style={{ display: "grid", gap: "2rem", marginBottom: "2rem" }}>

            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.875rem" }}>
                {displayLogo
                  ? <img src={displayLogo} alt="Logo" style={{ height: 30, objectFit: "contain" }} />
                  : <div style={{ width: 34, height: 34, borderRadius: "0.5rem", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center" }}><FaWind style={{ color: "#fff", fontSize: "0.9rem" }} /></div>
                }
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{companyName}</div>
                  <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.03em" }}>Premium Electronics</div>
                </div>
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", lineHeight: 1.7, marginBottom: "1rem", maxWidth: 280 }}>
                প্রিমিয়াম ইলেকট্রনিক্স পণ্য নিয়ে আপনার পাশে আছি। সেরা কোয়ালিটি, সেরা সার্ভিস আমাদের অঙ্গীকার।
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {displaySocialLinks.facebook && (
                  <a href={displaySocialLinks.facebook} target="_blank" rel="noopener noreferrer"
                    style={{ width: 32, height: 32, borderRadius: "0.5rem", background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none" }}>
                    <FaInstagram />
                  </a>
                )}
                {displaySocialLinks.instagram && (
                  <a href={displaySocialLinks.instagram} target="_blank" rel="noopener noreferrer"
                    style={{ width: 32, height: 32, borderRadius: "0.5rem", background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none" }}>
                    <FaInstagram />
                  </a>
                )}
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                  style={{ width: 32, height: 32, borderRadius: "0.5rem", background: "rgba(37,211,102,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: C.red, textDecoration: "none" }}>
                  <FaWhatsapp />
                </a>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 style={{ fontWeight: 700, fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>মার্কেটি লিংক</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {navLinks.map(n => (
                  <a key={n.label} href={n.href}
                    style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", textDecoration: "none" }}>
                    {n.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 style={{ fontWeight: 700, fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>আমাদের সেবা</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {["ডেলিভারি তথ্য", "রিটার্ন পলিসি", "প্রাইভেসি পলিসি"].map((l, i) => (
                  <a key={i} href="#" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", textDecoration: "none" }}>{l}</a>
                ))}
                {termsContent && (
                  <button onClick={() => setShowTerms(true)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", textAlign: "left", padding: 0, fontFamily: "inherit" }}>
                    শর্তাবলী
                  </button>
                )}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontWeight: 700, fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>যোগাযোগ</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", fontSize: "0.82rem" }}>
                {displayPhone && (
                  <a href={`tel:${displayPhone}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
                    <FaPhoneAlt style={{ fontSize: "0.7rem", color: C.blue }} /> {displayPhone}
                  </a>
                )}
                {displayEmail && (
                  <a href={`mailto:${displayEmail}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.45)", textDecoration: "none", wordBreak: "break-all" }}>
                    <FaEnvelope style={{ fontSize: "0.7rem", color: C.blue }} /> {displayEmail}
                  </a>
                )}
                {displayAddress && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "rgba(255,255,255,0.45)" }}>
                    <FaMapMarkerAlt style={{ fontSize: "0.7rem", color: C.blue, marginTop: 3, flexShrink: 0 }} /> {displayAddress}
                  </div>
                )}
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.22)", color: C.red, textDecoration: "none", padding: "0.5rem 0.875rem", borderRadius: "0.5rem", marginTop: "0.25rem", width: "fit-content", fontSize: "0.8rem" }}>
                  <FaWhatsapp /> মেসেজ পাঠান
                </a>
              </div>
            </div>

          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.25rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.28)", textAlign: "center" }}>
            © {new Date().getFullYear()} {companyName}. সকল অধিকার সংরক্ষিত।
          </div>
        </div>
      </footer>

      {/* ═══════════ MOBILE BOTTOM BAR ═══════════ */}
      <div className="bottom-bar" style={{
        display: "none", position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90,
        background: C.footerBg, borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "0.625rem 1rem", alignItems: "center", gap: "0.75rem",
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{productName}</div>
          <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#60a5fa" }}>
            {selectedVariant ? `৳${selectedVariant.price.toFixed(0)}` : "—"}
          </div>
        </div>
        <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
          style={{ width: 42, height: 42, borderRadius: "0.5rem", background: C.red, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none", flexShrink: 0, fontSize: "1.1rem" }}>
          <FaWhatsapp />
        </a>
        <button onClick={scrollToOrder} className="btn-primary" style={{ padding: "0.625rem 1.125rem", fontSize: "0.85rem", flexShrink: 0 }}>
          <FaShoppingCart /> অর্ডার
        </button>
      </div>
      <div className="bottom-bar" style={{ display: "none", height: 60 }} />

      {/* ═══════════ FLOATING BUTTONS (desktop) ═══════════ */}
      <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", display: "flex", flexDirection: "column", gap: "0.625rem", zIndex: 50 }}>
        <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
          style={{ width: 48, height: 48, borderRadius: "0.875rem", background: C.red, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.3rem", boxShadow: "0 4px 16px rgba(37,211,102,0.4)", textDecoration: "none" }}>
          <FaWhatsapp />
        </a>
        <a href={`tel:${displayPhone}`}
          style={{ width: 48, height: 48, borderRadius: "0.875rem", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.1rem", boxShadow: "0 4px 16px rgba(26,86,219,0.4)", textDecoration: "none" }}>
          <FaPhoneAlt />
        </a>
      </div>

      {/* ═══════════ TERMS MODAL ═══════════ */}
      {showTerms && termsContent && (
        <div onClick={() => setShowTerms(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: "1.25rem", maxWidth: 500, width: "100%", maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.125rem 1.375rem", borderBottom: `1px solid ${C.divider}` }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: C.textDark }}>টার্মস & কন্ডিশন</h2>
              <button onClick={() => setShowTerms(false)} style={{ background: "#f1f5f9", border: "none", color: C.textDark, width: 30, height: 30, borderRadius: "0.5rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FaTimes />
              </button>
            </div>
            <div style={{ padding: "1.375rem", overflowY: "auto", fontSize: "0.875rem", lineHeight: 1.7, color: C.textGray, whiteSpace: "pre-wrap" }}>
              {termsContent}
            </div>
            <div style={{ padding: "1rem 1.375rem", borderTop: `1px solid ${C.divider}` }}>
              <button onClick={() => setShowTerms(false)} className="btn-primary" style={{ width: "100%", padding: "0.875rem" }}>বন্ধ করুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}