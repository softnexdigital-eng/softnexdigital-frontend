"use client";

import {
  FaWhatsapp,
  FaPhoneAlt,
  FaHeart,
  FaShoppingCart,
  FaSearch,
  FaBars,
  FaLeaf,
  FaTimes,
} from "react-icons/fa";
import type { Product, Variant, LandingPage, Tenant } from "@/types";
import { formatAttributes } from "@/lib/attrUtils";
import { useState } from "react";

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
  mobileSidebarOpen,
  setMobileSidebarOpen,
  isScrolled,
  primary,
  whatsappNumber,
  data,
}: NavbarProps) {
  const handleSuggestionClick = (variant: Variant) => {
    updateVariantAndProduct(variant);
    setSearchQuery("");
    setShowSuggestions(false);
    setMobileSearchOpen(false);
  };
  
  const primaryLight = "#FFF1F2"; // rose-50

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-gray-200 transition-shadow duration-300"
      style={{ boxShadow: isScrolled ? "0 2px 16px rgba(0,0,0,0.08)" : "none" }}
    >
      <div className="max-w-[1620px] mx-auto px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
        {/* হ্যামবার্গার (মোবাইল ও ট্যাবলেট) */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden flex items-center justify-center w-10 h-10 text-gray-700 hover:text-gray-900 transition-colors active:scale-95 hover:bg-gray-100"
          style={{ borderRadius: "10px" }}
          aria-label="Open menu"
        >
          <FaBars className="text-xl" />
        </button>

        {/* লোগো */}
        <a href="#" className="flex items-center gap-2 flex-shrink-0 group">
          {displayLogo ? (
            <img src={displayLogo} alt="Logo" className="h-9 sm:h-10 w-auto object-contain" style={{ borderRadius: "8px" }} />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 flex items-center justify-center" style={{ background: primary, borderRadius: "8px" }}>
                <FaLeaf className="text-white text-lg" />
              </div>
              <div className="flex flex-col">
                <div className="font-extrabold text-xs sm:text-sm text-gray-900 leading-tight truncate max-w-[100px] sm:max-w-none">
                  {companyName}
                </div>
                <div className="text-[9px] font-bold" style={{ color: primary }}>প্রিমিয়াম পণ্য</div>
              </div>
            </div>
          )}
        </a>

        {/* ডেস্কটপ সার্চ (md-এর উপরে) */}
        <div className="hidden md:flex flex-1 items-center justify-center max-w-3xl mx-auto relative">
          <div className="flex w-full border-2 overflow-hidden shadow-sm hover:shadow-md bg-white" style={{ borderColor: "#D1D5DB", borderRadius: "10px" }}>
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="flex-1 px-4 py-2.5 text-sm bg-transparent text-gray-700 outline-none placeholder-gray-400"
              style={{ borderRadius: "10px 0 0 10px" }}
              placeholder="পণ্য খুঁজুন (নাম, বৈশিষ্ট্য, দাম)..."
            />
            <button className="px-5 py-2.5 text-white text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all duration-250" style={{ background: primary }}>
              <FaSearch className="text-sm" />
              <span className="hidden lg:inline">খুঁজুন</span>
            </button>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg z-30 mt-1 max-h-80 overflow-y-auto" style={{ borderRadius: "10px" }}>
              {suggestions.map((v) => (
                <div
                  key={v.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                  onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(v); }}
                >
                  {v.image ? <img src={v.image} alt="" className="w-10 h-10 object-cover" style={{ borderRadius: "8px" }} /> : <div className="w-10 h-10 bg-gray-100 flex items-center justify-center" style={{ borderRadius: "8px" }}><FaLeaf className="text-gray-400" /></div>}
                  <div className="flex-1">
                    <div className="font-bold text-gray-800 text-sm">{data.product?.name}</div>
                    <div className="text-xs text-gray-500">{formatAttributes(v.attributes, ", ")}</div>
                    <div className="text-sm font-black" style={{ color: primary }}>৳{v.price}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ডান পাশের আইকন (ডেস্কটপ ও মোবাইল) */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 ml-auto flex-shrink-0">
          {/* ডেস্কটপ ফোন (শুধু lg-তে) */}
          <a href={`tel:${displayPhone}`} className="hidden lg:flex items-center gap-2 group">
            <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm" style={{ background: primaryLight, borderRadius: "10px" }}>
              <FaPhoneAlt style={{ color: primary, fontSize: "14px" }} />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] text-gray-500 font-semibold tracking-wide">হটলাইন</div>
              <div className="text-xs sm:text-sm font-black text-gray-800 group-hover:text-gray-900">{displayPhone}</div>
            </div>
          </a>

          {/* মোবাইলে সার্চ টগল (md-এর নিচে) */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 text-gray-700 hover:text-gray-900 transition-colors active:scale-95 hover:bg-gray-100"
            style={{ borderRadius: "10px" }}
            aria-label="Toggle search"
          >
            {mobileSearchOpen ? <FaTimes className="text-lg" /> : <FaSearch className="text-lg" />}
          </button>

          {/* উইশলিস্ট (শুধু sm-এর উপরে) */}
          <button
            onClick={() => setWishlistDrawerOpen(true)}
            className="hidden sm:flex relative w-9 h-9 items-center justify-center text-gray-700 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
            style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "10px" }}
          >
            <FaHeart className="text-sm" style={{ color: "#9CA3AF" }} />
            {wishlistIds.size > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm border-2 border-white" style={{ borderRadius: "8px" }}>
                {wishlistIds.size}
              </span>
            )}
          </button>

          {/* কার্ট (সব স্ক্রিনে) */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="relative w-10 h-10 flex items-center justify-center text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
            style={{ background: primary, borderRadius: "10px" }}
          >
            <FaShoppingCart className="text-base" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm border-2 border-white" style={{ borderRadius: "8px" }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* মোবাইল সার্চ বার (ভাঁজযোগ্য) */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileSearchOpen ? "max-h-96 opacity-100 py-3 px-3" : "max-h-0 opacity-0 py-0 px-3"
        }`}
      >
        <div className="flex items-center border-2 overflow-hidden shadow-sm bg-white" style={{ borderColor: "#D1D5DB", borderRadius: "10px" }}>
          <input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="flex-1 px-4 py-3 text-sm bg-white outline-none placeholder-gray-400"
            placeholder="পণ্য খুঁজুন..."
          />
          <button className="px-4 py-3 text-white text-sm font-medium" style={{ background: primary }}>
            <FaSearch />
          </button>
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div className="bg-white border border-gray-200 shadow-lg mt-2 max-h-60 overflow-y-auto" style={{ borderRadius: "10px" }}>
            {suggestions.map((v) => (
              <div
                key={v.id}
                className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(v); }}
              >
                {v.image ? <img src={v.image} alt="" className="w-10 h-10 object-cover" style={{ borderRadius: "8px" }} /> : <div className="w-10 h-10 bg-gray-100 flex items-center justify-center" style={{ borderRadius: "8px" }}><FaLeaf className="text-gray-400" /></div>}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 text-sm truncate">{data.product?.name}</div>
                  <div className="text-xs text-gray-500 truncate">{formatAttributes(v.attributes, ", ")}</div>
                  <div className="text-sm font-black" style={{ color: primary }}>৳{v.price}</div>
                </div>
              </div>
            ))}
            {suggestions.length > 0 && (
              <div className="p-2 text-center text-sm text-gray-500 border-t border-gray-100">{suggestions.length} ফলাফল পাওয়া গেছে</div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}