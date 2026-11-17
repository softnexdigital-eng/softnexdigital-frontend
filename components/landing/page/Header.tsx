"use client";

import { FiHeart, FiShoppingCart } from "react-icons/fi";

interface HeaderProps {
  logo?: string | null;
  companyName?: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  cartCount: number;
  primary: string;
  onSearch?: (q: string) => void;
  onOpenWishlist?: () => void;
  onOpenCart?: () => void;
  placeholder?: boolean;
}

const iconBtn =
  "relative grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl transition-opacity hover:opacity-90";

export default function Header({
  logo,
  companyName,
  searchQuery,
  setSearchQuery,
  cartCount,
  primary,
  onSearch,
  onOpenWishlist,
  onOpenCart,
  placeholder = false,
}: HeaderProps) {
  const name = companyName?.trim() || "";
  const logoText = placeholder || !name ? "সা" : Array.from(name)[0];

  return (
    <header className="border-b border-[#e7e8ec] bg-white">
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center gap-3 px-5 sm:gap-5">
        {/* Logo */}
        <a href="#" className="flex flex-shrink-0 items-center" aria-label={name || "হোম"}>
          {logo ? (
            <img src={logo} alt={name || "লোগো"} className="h-11 w-auto max-w-[180px] object-contain" />
          ) : (
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#eceef2] text-[11px] font-semibold text-[#6b6f78]">
              {logoText}
            </span>
          )}
        </a>

        {/* Search (input + button joined) */}
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            onSearch?.(searchQuery.trim());
          }}
          className="flex h-11 min-w-0 flex-1 overflow-hidden rounded-xl border border-[#e7e8ec] bg-[#f1f2f5] transition-colors focus-within:border-gray-300 focus-within:bg-white"
        >
          <input
            type="text"
            aria-label="পণ্য খুঁজুন"
            placeholder="পণ্য খুঁজুন (নাম, ক্যাটাগরি, দাম)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-0 flex-1 bg-transparent px-4 text-sm text-gray-800 outline-none placeholder:text-[#6b6f78]"
          />
          <button
            type="submit"
            className="px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: primary }}
          >
            খুঁজুন
          </button>
        </form>

        {/* Wishlist + Cart */}
        <div className="flex flex-shrink-0 items-center gap-3 sm:gap-5">
          <button
            type="button"
            onClick={onOpenWishlist}
            aria-label="উইশলিস্ট"
            className={`${iconBtn} border border-[#e7e8ec] bg-white text-[#17181c] hover:bg-gray-50`}
          >
            <FiHeart className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={cartCount > 0 ? `কার্ট (${cartCount})` : "কার্ট"}
            className={`${iconBtn} text-white`}
            style={{ background: primary }}
          >
            <FiShoppingCart className="h-[18px] w-[18px]" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#17181c] px-1 text-[10px] font-bold text-white">
                {cartCount > 9 ? "৯+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}