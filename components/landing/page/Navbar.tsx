"use client";

import {
  FaPhoneAlt,
  FaHeart,
  FaShoppingCart,
  FaSearch,
  FaBars,
  FaTimes,
  FaRegImage,
} from "react-icons/fa";
import type { Product, Variant, LandingPage, Tenant } from "@/types";
import { formatAttributes } from "@/lib/attrUtils";

interface NavbarProps {
  displayLogo: string | null;
  displayPhone: string;
  companyName: string;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  showSuggestions: boolean;
  setShowSuggestions: (v: boolean) => void;
  suggestions: Variant[];
  updateVariantAndProduct: (v: Variant) => void;
  wishlistIds: Set<string>;
  setWishlistDrawerOpen: (v: boolean) => void;
  cartCount: number;
  setCartDrawerOpen: (v: boolean) => void;
  mobileSearchOpen: boolean;
  setMobileSearchOpen: (v: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (v: boolean) => void;
  isScrolled: boolean;
  primary: string;
  whatsappNumber: string;
  data: { page?: LandingPage; product?: Product; tenant?: Tenant };
}

function SuggestionList({
  suggestions,
  productName,
  primary,
  onPick,
  className,
  showCount,
}: {
  suggestions: Variant[];
  productName?: string;
  primary: string;
  onPick: (v: Variant) => void;
  className: string;
  showCount?: boolean;
}) {
  return (
    <div className={className}>
      {suggestions.map((v) => (
        <div
          key={v.id}
          className="flex cursor-pointer items-center gap-3 border-b border-gray-50 p-3 transition-colors last:border-b-0 hover:bg-gray-50 active:bg-gray-100"
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(v);
          }}
        >
          {v.image ? (
            <img src={v.image} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
              <FaRegImage />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-gray-900">{productName}</div>
            <div className="mt-0.5 truncate text-xs text-gray-500">{formatAttributes(v.attributes, ", ")}</div>
          </div>
          <div className="flex-shrink-0 text-sm font-bold" style={{ color: primary }}>
            ৳{v.price}
          </div>
        </div>
      ))}
      {showCount && (
        <div className="border-t border-gray-50 p-2.5 text-center text-xs text-gray-500">
          {suggestions.length} ফলাফল পাওয়া গেছে
        </div>
      )}
    </div>
  );
}

export default function Navbar({
  displayLogo,
  displayPhone,
  companyName,
  searchQuery,
  setSearchQuery,
  showSuggestions,
  setShowSuggestions,
  suggestions,
  updateVariantAndProduct,
  wishlistIds,
  setWishlistDrawerOpen,
  cartCount,
  setCartDrawerOpen,
  mobileSearchOpen,
  setMobileSearchOpen,
  setMobileSidebarOpen,
  isScrolled,
  primary,
  data,
}: NavbarProps) {
  const handleSuggestionClick = (variant: Variant) => {
    updateVariantAndProduct(variant);
    setSearchQuery("");
    setShowSuggestions(false);
    setMobileSearchOpen(false);
  };

  const iconBtn =
    "relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-gray-700 transition-all hover:bg-gray-100 active:scale-95 sm:h-11 sm:w-11";

  return (
    <header
      className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur transition-shadow duration-300"
      style={{
        boxShadow: isScrolled ? "0 4px 20px rgba(0,0,0,0.06)" : "none",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div className="mx-auto flex max-w-[1620px] items-center gap-2 px-3 py-2 sm:gap-4 sm:px-5 sm:py-3 lg:gap-8 lg:px-8">
        {/* Menu (mobile/tablet) */}
        <button onClick={() => setMobileSidebarOpen(true)} className={`${iconBtn} lg:hidden -ml-1`} aria-label="মেনু খুলুন">
          <FaBars className="text-lg" />
        </button>

        {/* Logo */}
        <a href="#" className="flex min-w-0 flex-shrink-0 items-center gap-2.5">
          {displayLogo ? (
            <img
              src={displayLogo}
              alt={companyName || "Logo"}
              className="h-9 w-auto max-w-[130px] object-contain sm:h-11 sm:max-w-[180px] lg:h-12"
            />
          ) : (
            <>
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base font-bold text-white sm:h-11 sm:w-11 sm:text-lg"
                style={{ background: primary }}
              >
                {companyName?.charAt(0) || "S"}
              </div>
              <div className="min-w-0 leading-tight">
                <div className="max-w-[110px] truncate text-sm font-bold text-gray-900 sm:max-w-[200px] sm:text-base">
                  {companyName}
                </div>
                <div className="hidden text-[11px] font-medium text-gray-500 sm:block">অফিসিয়াল শপ</div>
              </div>
            </>
          )}
        </a>

        {/* Desktop / tablet search */}
        <div className="relative mx-auto hidden max-w-2xl flex-1 md:block">
          <div className="flex w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-all focus-within:border-gray-300 focus-within:bg-white focus-within:shadow-sm">
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
              placeholder="পণ্য খুঁজুন (নাম, বৈশিষ্ট্য, দাম)..."
            />
            <button
              className="flex items-center gap-2 px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: primary }}
              aria-label="খুঁজুন"
            >
              <FaSearch className="text-sm" />
              <span className="hidden lg:inline">খুঁজুন</span>
            </button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <SuggestionList
              suggestions={suggestions}
              productName={data.product?.name}
              primary={primary}
              onPick={handleSuggestionClick}
              className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-xl"
            />
          )}
        </div>

        {/* Right actions */}
        <div className="ml-auto flex flex-shrink-0 items-center gap-1 sm:gap-2 lg:gap-3">
          {/* Hotline (desktop) */}
          <a href={`tel:${displayPhone}`} className="group mr-2 hidden items-center gap-2.5 lg:flex">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: `${primary}12`, color: primary }}
            >
              <FaPhoneAlt className="text-sm" />
            </div>
            <div className="leading-tight">
              <div className="text-[11px] font-medium text-gray-500">হটলাইন</div>
              <div className="text-sm font-bold text-gray-900">{displayPhone}</div>
            </div>
          </a>

          {/* Call (tablet) */}
          <a href={`tel:${displayPhone}`} className={`${iconBtn} hidden sm:flex lg:hidden`} aria-label="কল করুন">
            <FaPhoneAlt className="text-base" style={{ color: primary }} />
          </a>

          {/* Search toggle (mobile) */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className={`${iconBtn} md:hidden`}
            aria-label="সার্চ"
          >
            {mobileSearchOpen ? <FaTimes className="text-lg" /> : <FaSearch className="text-base" />}
          </button>

          {/* Wishlist */}
          <button onClick={() => setWishlistDrawerOpen(true)} className={iconBtn} aria-label="উইশলিস্ট">
            <FaHeart className="text-base" style={{ color: wishlistIds.size > 0 ? "#EF4444" : "#9CA3AF" }} />
            {wishlistIds.size > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold text-white">
                {wishlistIds.size}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-all hover:opacity-95 active:scale-95 sm:h-11 sm:w-11"
            style={{ background: primary }}
            aria-label="কার্ট"
          >
            <FaShoppingCart className="text-base" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-gray-900 px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div
        className={`overflow-hidden px-3 transition-all duration-300 ease-in-out md:hidden ${
          mobileSearchOpen ? "max-h-[28rem] pb-3 opacity-100" : "max-h-0 pb-0 opacity-0"
        }`}
      >
        <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 focus-within:bg-white">
          <input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="flex-1 bg-transparent px-4 py-3 text-base text-gray-800 outline-none placeholder:text-gray-400"
            placeholder="পণ্য খুঁজুন..."
          />
          <button className="px-5 py-3.5 text-white" style={{ background: primary }} aria-label="খুঁজুন">
            <FaSearch className="text-base" />
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <SuggestionList
            suggestions={suggestions}
            productName={data.product?.name}
            primary={primary}
            onPick={handleSuggestionClick}
            showCount
            className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg"
          />
        )}
      </div>
    </header>
  );
}
