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
      className="sticky top-0 z-50 bg-white border-b border-gray-100 transition-all duration-300"
      style={{
        boxShadow: isScrolled
          ? "0 4px 20px rgba(0,0,0,0.08)"
          : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="max-w-[1620px] mx-auto px-3 sm:px-5 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-5 lg:gap-8">
        {/* Hamburger - Mobile & Tablet */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden flex items-center justify-center w-11 h-11 text-gray-700 hover:text-gray-900 transition-all active:scale-95 hover:bg-gray-50"
          style={{ borderRadius: "12px" }}
          aria-label="Open menu"
        >
          <FaBars className="text-xl" />
        </button>

        {/* Logo - Larger & clearer on both desktop and mobile */}
        <a
          href="#"
          className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0 group"
        >
          {displayLogo ? (
            <img
              src={displayLogo}
              alt={companyName || "Logo"}
              className="h-11 sm:h-12 md:h-14 lg:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              style={{ borderRadius: "10px" }}
            />
          ) : (
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105"
                style={{ background: primary, borderRadius: "12px" }}
              >
                <FaLeaf className="text-white text-xl sm:text-2xl md:text-2xl lg:text-3xl" />
              </div>
              <div className="flex flex-col">
                <div className="font-extrabold text-sm sm:text-base md:text-lg text-gray-900 leading-tight truncate max-w-[120px] sm:max-w-[160px] md:max-w-none">
                  {companyName}
                </div>
                <div
                  className="text-[10px] sm:text-xs font-bold tracking-wide"
                  style={{ color: primary }}
                >
                  প্রিমিয়াম পণ্য
                </div>
              </div>
            </div>
          )}
        </a>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 items-center justify-center max-w-2xl lg:max-w-3xl mx-auto relative">
          <div
            className="flex w-full border-2 overflow-hidden bg-white transition-all duration-300 hover:shadow-md focus-within:shadow-md focus-within:border-opacity-100"
            style={{
              borderColor: "#E5E7EB",
              borderRadius: "14px",
            }}
          >
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="flex-1 px-5 py-3 text-sm bg-transparent text-gray-700 outline-none placeholder-gray-400"
              style={{ borderRadius: "14px 0 0 14px" }}
              placeholder="পণ্য খুঁজুন (নাম, বৈশিষ্ট্য, দাম)..."
            />
            <button
              className="px-5 lg:px-6 py-3 text-white text-sm font-bold flex items-center gap-2 hover:opacity-95 transition-all duration-200 active:scale-[0.98]"
              style={{ background: primary }}
            >
              <FaSearch className="text-sm" />
              <span className="hidden lg:inline">খুঁজুন</span>
            </button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 bg-white border border-gray-100 shadow-xl z-30 mt-2 max-h-80 overflow-y-auto"
              style={{ borderRadius: "14px" }}
            >
              {suggestions.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 hover:bg-gray-50 cursor-pointer flex items-center gap-3.5 border-b border-gray-50 last:border-b-0 transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSuggestionClick(v);
                  }}
                >
                  {v.image ? (
                    <img
                      src={v.image}
                      alt=""
                      className="w-12 h-12 object-cover flex-shrink-0"
                      style={{ borderRadius: "10px" }}
                    />
                  ) : (
                    <div
                      className="w-12 h-12 bg-gray-100 flex items-center justify-center flex-shrink-0"
                      style={{ borderRadius: "10px" }}
                    >
                      <FaLeaf className="text-gray-400 text-lg" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 text-sm truncate">
                      {data.product?.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {formatAttributes(v.attributes, ", ")}
                    </div>
                    <div
                      className="text-sm font-black mt-1"
                      style={{ color: primary }}
                    >
                      ৳{v.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3.5 ml-auto flex-shrink-0">
          {/* Desktop Phone */}
          <a
            href={`tel:${displayPhone}`}
            className="hidden lg:flex items-center gap-2.5 group"
          >
            <div
              className="w-11 h-11 flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-sm"
              style={{ background: primaryLight, borderRadius: "12px" }}
            >
              <FaPhoneAlt style={{ color: primary, fontSize: "15px" }} />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] text-gray-500 font-semibold tracking-wide uppercase">
                হটলাইন
              </div>
              <div className="text-sm font-black text-gray-800 group-hover:text-gray-900 transition-colors">
                {displayPhone}
              </div>
            </div>
          </a>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden flex items-center justify-center w-11 h-11 text-gray-700 hover:text-gray-900 transition-all active:scale-95 hover:bg-gray-50"
            style={{ borderRadius: "12px" }}
            aria-label="Toggle search"
          >
            {mobileSearchOpen ? (
              <FaTimes className="text-lg" />
            ) : (
              <FaSearch className="text-lg" />
            )}
          </button>

          {/* Wishlist */}
          <button
            onClick={() => setWishlistDrawerOpen(true)}
            className="hidden sm:flex relative w-10 h-10 sm:w-11 sm:h-11 items-center justify-center text-gray-600 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 bg-white border border-gray-200"
            style={{ borderRadius: "12px" }}
          >
            <FaHeart className="text-base" style={{ color: "#9CA3AF" }} />
            {wishlistIds.size > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm border-2 border-white"
                style={{ borderRadius: "8px" }}
              >
                {wishlistIds.size}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="relative w-11 h-11 flex items-center justify-center text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
            style={{ background: primary, borderRadius: "12px" }}
          >
            <FaShoppingCart className="text-lg" />
            {cartCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm border-2 border-white"
                style={{ borderRadius: "8px" }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileSearchOpen
            ? "max-h-96 opacity-100 py-3 px-3"
            : "max-h-0 opacity-0 py-0 px-3"
        }`}
      >
        <div
          className="flex items-center border-2 overflow-hidden shadow-sm bg-white"
          style={{ borderColor: "#E5E7EB", borderRadius: "14px" }}
        >
          <input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="flex-1 px-4 py-3.5 text-sm bg-white outline-none placeholder-gray-400"
            placeholder="পণ্য খুঁজুন..."
          />
          <button
            className="px-5 py-3.5 text-white text-sm font-medium"
            style={{ background: primary }}
          >
            <FaSearch className="text-base" />
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div
            className="bg-white border border-gray-100 shadow-xl mt-2.5 max-h-64 overflow-y-auto"
            style={{ borderRadius: "14px" }}
          >
            {suggestions.map((v) => (
              <div
                key={v.id}
                className="p-3.5 hover:bg-gray-50 cursor-pointer flex items-center gap-3.5 border-b border-gray-50 last:border-b-0"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(v);
                }}
              >
                {v.image ? (
                  <img
                    src={v.image}
                    alt=""
                    className="w-12 h-12 object-cover flex-shrink-0"
                    style={{ borderRadius: "10px" }}
                  />
                ) : (
                  <div
                    className="w-12 h-12 bg-gray-100 flex items-center justify-center flex-shrink-0"
                    style={{ borderRadius: "10px" }}
                  >
                    <FaLeaf className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 text-sm truncate">
                    {data.product?.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {formatAttributes(v.attributes, ", ")}
                  </div>
                  <div
                    className="text-sm font-black mt-1"
                    style={{ color: primary }}
                  >
                    ৳{v.price}
                  </div>
                </div>
              </div>
            ))}
            {suggestions.length > 0 && (
              <div className="p-2.5 text-center text-sm text-gray-500 border-t border-gray-50">
                {suggestions.length} ফলাফল পাওয়া গেছে
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}