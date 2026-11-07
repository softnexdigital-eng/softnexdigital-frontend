"use client";

import { useEffect, useMemo, useRef } from "react";
import { useVariantSelection } from "@/lib/useVariantSelection";
import {
  FaAward,
  FaStar,
  FaCheck,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaWhatsapp,
  FaHeart,
  FaRegHeart,
  FaLeaf,
  FaTruck,
  FaPalette,
  FaTag,
  FaBox,
  FaBolt,
  FaShieldAlt,
  FaChevronDown,
  FaImage,
} from "react-icons/fa";

interface HeroSectionProps {
  selectedVariant: any;
  selectedProduct: any;
  data: any;
  variants?: any[];
  productImage: string | null;
  allImages: string[];
  activeGallery: number;
  setActiveGallery: (i: number) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  roundToStep: (v: number) => number;
  QUANTITY_STEP: number;
  avgRating: number;
  reviewsCount: number;
  trustBar: any[];
  features: string[];
  variantDetails: string[];
  badge: string;
  tagline: string;
  addToCart: (id: string, qty?: number, attrs?: Record<string, string>) => void;
  onInitiateCheckout?: (productId: string, quantity: number) => void;
  updateVariantAndProduct: (v: any) => void;
  switchVariant?: (v: any) => void;
  toggleWishlist: (id: string) => void;
  cartLoadingItems: Set<string>;
  wishlistIds: Set<string>;
  isFreeDelivery: boolean;
  formatBanglaNum: (n: number | string) => string;
  formatBanglaDate: (d: Date) => string;
  bdDateObj: Date;
  primary: string;
  primaryDark: string;
  primaryMuted: string;
  primaryLight: string;
  orderNowLink: string;
  whatsappLink: string;
  whatsappVariantLink: (name: string) => string;
  heroWishlistBtnClass: string;
  onColorChange?: (color: string | null) => void;
  /** @deprecated onVariantChange already carries the attributes. Kept so old callers still compile. */
  onVariantAttrsChange?: (attrs: { [key: string]: string }) => void;
  onVariantChange?: (variant: any | null, attrs: { [key: string]: string }) => void;
}

/* ------------------------------------------------------------------ */
/* Everything below is derived from backend data. Nothing is hardcoded */
/* per attribute name, so it works for clothing, grocery, anything.    */
/* ------------------------------------------------------------------ */

const NOT_COLORS = new Set(["inherit", "initial", "unset", "revert", "transparent", "currentcolor"]);

// A value is a "color" only if the browser accepts it as a CSS color (red, #3b82f6, rgb(...), ...).
const toCssColor = (value: string): string | null => {
  const s = String(value).trim();
  if (!s || NOT_COLORS.has(s.toLowerCase())) return null;
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return null;
  return CSS.supports("color", s) ? s : null;
};

const prettifyKey = (key: string) =>
  key.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").trim();

const MANY_OPTIONS = 12; // above this, a dropdown is easier than a wall of buttons

function SectionHead({
  icon,
  label,
  value,
  needed,
  primary,
  primaryLight,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  needed?: boolean;
  primary: string;
  primaryLight: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm"
        style={{ background: primaryLight, color: primary }}
      >
        {icon}
      </span>
      <span className="text-base font-bold capitalize text-slate-900">{label}</span>
      {value && <span className="truncate text-sm text-gray-500">{value}</span>}
      {needed && (
        <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
          বাছাই করুন
        </span>
      )}
    </div>
  );
}

export default function HeroSection({
  selectedVariant,
  selectedProduct,
  data,
  variants: propVariants,
  productImage,
  allImages,
  activeGallery,
  setActiveGallery,
  quantity,
  setQuantity,
  roundToStep,
  QUANTITY_STEP,
  avgRating,
  reviewsCount,
  trustBar,
  features,
  badge,
  tagline,
  addToCart,
  onInitiateCheckout,
  updateVariantAndProduct,
  switchVariant,
  toggleWishlist,
  cartLoadingItems,
  wishlistIds,
  isFreeDelivery,
  formatBanglaNum,
  // backend colors are ignored: the theme is fixed to rose below
  primary: _primary,
  primaryDark: _primaryDark,
  primaryLight: _primaryLight,
  orderNowLink,
  whatsappVariantLink,
  heroWishlistBtnClass,
  onColorChange,
  onVariantChange,
}: HeroSectionProps) {
  // Fixed rose theme
  const primary = "#E11D48"; // rose-600
  const primaryDark = "#BE123C"; // rose-700
  const primaryLight = "#FFF1F2"; // rose-50

  const allVariants = propVariants || data?.variants || [];

  // Only variants of the currently selected product (fallback: all, if productId is missing on the data)
  const variants = useMemo(() => {
    if (!selectedProduct?.id) return allVariants;
    const filtered = allVariants.filter((v: any) => v.productId === selectedProduct.id);
    return filtered.length > 0 ? filtered : allVariants;
  }, [allVariants, selectedProduct]);

  const selection = useVariantSelection({
    variants,
    selectedVariantId: selectedVariant?.id,
  });
  const activeVariant = selection.selectedVariant || selectedVariant;

  // One guard for every buy / cart / whatsapp button
  const canBuy = !!activeVariant && activeVariant.stock > 0 && selection.isComplete;

  // Push the hook's selection up to the page (hook -> page)
  useEffect(() => {
    if (!selection.selectedVariant) return;
    onVariantChange?.(selection.selectedVariant, selection.selectedAttributes);
  }, [selection.selectedAttributes, selection.selectedVariant, onVariantChange]);

  const name = selectedProduct?.name || data?.product?.name || data?.name || "";
  const description =
    selectedProduct?.description || data?.product?.description || data?.description || "";

  // Optional backend translations, e.g. product.attributeLabels = { size: "সাইজ" }.
  const labelOf = (key: string): string =>
    selectedProduct?.attributeLabels?.[key] ||
    data?.tenant?.attributeLabels?.[key] ||
    prettifyKey(key);

  const unit: string = activeVariant?.unit || selectedProduct?.unit || data?.product?.unit || "";

  const handleGalleryImageClick = (img: string, idx: number) => {
    const matchingVariant = variants?.find((v: any) => {
      if (v.image === img) return true;
      if (v.variantImages && Array.isArray(v.variantImages)) {
        return v.variantImages.some((vi: any) => vi.url === img);
      }
      return false;
    });
    if (matchingVariant && matchingVariant.stock > 0) {
      selection.selectVariant(matchingVariant);
      (switchVariant || updateVariantAndProduct)(matchingVariant);
    } else if (matchingVariant) {
      return;
    } else {
      setActiveGallery(idx);
    }
  };

  const thumbsRef = useRef<HTMLDivElement>(null);
  const scrollThumbs = () => thumbsRef.current?.scrollBy({ top: 96, behavior: "smooth" });

  const selectedLabel = Object.values(selection.selectedAttributes).join(" / ");

  const price: number = activeVariant?.price ?? 0;
  const compareAt: number = activeVariant?.compareAtPrice ?? 0;
  const discountPct = compareAt > price && price > 0 ? Math.round((1 - price / compareAt) * 100) : 0;
  const outOfStock = !!activeVariant && activeVariant.stock <= 0;
  const lowStock = !!activeVariant && activeVariant.stock > 0 && activeVariant.stock <= 5;
  const missing = selection.groups.filter((g) => !selection.selectedAttributes[g.name]);
  const total = price * quantity;
  const wishlisted = !!activeVariant && wishlistIds.has(activeVariant.id);
  const cartBusy = cartLoadingItems.has(activeVariant?.id || "");
  const gradient = `linear-gradient(135deg, ${primary}, ${primaryDark})`;

  return (
    // Wrapper kills any inherited text-shadow / box-shadow glow inside the hero
    <div className="[&_*]:[text-shadow:none] [&_*]:!shadow-none">
      {/* TRUST BAR (from backend) */}
      {trustBar.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-4">
          {trustBar.map((s: any, i: number) => (
            <div key={i} className="bg-white px-4 py-3 text-center">
              <div className="text-sm font-bold text-gray-900">{s.value}</div>
              <div className="text-[11px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-gray-100 bg-white p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-8">
          {/* ===================== GALLERY ===================== */}
          <div className="flex min-w-0 flex-col gap-3 md:flex-row md:gap-4">
            {/* Thumbnails: row under the image on mobile, column at the left on desktop */}
            {allImages.length > 1 && (
              <div className="flex shrink-0 flex-col items-center gap-2 md:order-first">
                <div
                  ref={thumbsRef}
                  className="flex gap-3 overflow-x-auto scrollbar-hide md:max-h-[276px] md:flex-col md:overflow-y-auto md:overflow-x-hidden"
                >
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleGalleryImageClick(img, i)}
                      aria-label={`ছবি ${i + 1}`}
                      className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl border-2 bg-gray-50 transition-all md:h-[84px] md:w-[84px]"
                      style={{
                        borderColor: activeGallery === i ? primary : "transparent",
                      }}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
                {allImages.length > 3 && (
                  <button
                    type="button"
                    onClick={scrollThumbs}
                    aria-label="আরও ছবি"
                    className="hidden h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 md:flex"
                  >
                    <FaChevronDown className="text-xs" />
                  </button>
                )}
              </div>
            )}

            {/* Main image */}
            <div className="relative aspect-[4/3] w-full min-w-0 overflow-hidden rounded-2xl bg-gray-50 md:aspect-[4/5] md:flex-1">
              {productImage ? (
                <img
                  src={allImages[activeGallery] || productImage}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FaLeaf className="text-6xl text-gray-300" />
                </div>
              )}

              {/* Wishlist: top-left on mobile, top-right on desktop */}
              <button
                type="button"
                onClick={() => {
                  if (activeVariant) toggleWishlist(activeVariant.id);
                }}
                disabled={!activeVariant}
                aria-label="উইশলিস্ট"
                aria-pressed={wishlisted}
                className={`absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white transition-transform hover:scale-105 md:left-auto md:right-3 ${heroWishlistBtnClass}`}
              >
                {wishlisted ? (
                  <FaHeart className="text-lg text-rose-500" />
                ) : (
                  <FaRegHeart className="text-lg text-slate-700" />
                )}
              </button>

              {/* Counter: top-right on mobile, bottom-left on desktop */}
              {allImages.length > 1 && (
                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm md:bottom-3 md:left-3 md:right-auto md:top-auto">
                  <FaImage className="hidden text-[11px] md:block" />
                  {formatBanglaNum(activeGallery + 1)} / {formatBanglaNum(allImages.length)}
                </div>
              )}

              {discountPct > 0 && (
                <div className="absolute bottom-3 right-3 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white md:bottom-auto md:right-auto md:left-3 md:top-3 md:hidden">
                  -{formatBanglaNum(discountPct)}%
                </div>
              )}
            </div>
          </div>

          {/* ===================== INFO ===================== */}
          <div className="flex min-w-0 flex-col">
            {badge && (
              <div
                className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: primaryLight, color: primary }}
              >
                <FaAward className="text-[10px]" /> {badge}
              </div>
            )}

            {/* Title + price on the left, status pill on the right */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">{name}</h1>
                {tagline && <p className="mt-0.5 text-sm text-gray-500">{tagline}</p>}

                {activeVariant && (
                  <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-4xl font-extrabold leading-none sm:text-5xl" style={{ color: primary }}>
                      ৳{price.toFixed(0)}
                    </span>
                    {unit && <span className="text-sm text-gray-500">/ {unit}</span>}
                    {compareAt > price && (
                      <span className="text-base text-gray-400 line-through">৳{compareAt.toFixed(0)}</span>
                    )}
                    {discountPct > 0 && (
                      <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600">
                        -{formatBanglaNum(discountPct)}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              {activeVariant && (
                <span
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold"
                  style={
                    outOfStock
                      ? { background: primaryLight, color: primaryDark }
                      : lowStock
                        ? { background: primaryLight, color: primaryDark }
                        : { background: primaryLight, color: primary }
                  }
                >
                  <FaShieldAlt />
                  {outOfStock
                    ? "স্টক শেষ"
                    : lowStock
                      ? `মাত্র ${formatBanglaNum(activeVariant.stock)} বাকি`
                      : "স্টকে আছে"}
                </span>
              )}
            </div>

            {(reviewsCount > 0 || isFreeDelivery) && (
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                {reviewsCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <FaStar className="text-sm text-amber-400" />
                    <span className="text-xs font-semibold text-gray-900">{avgRating.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({formatBanglaNum(reviewsCount)} রিভিউ)</span>
                  </div>
                )}
                {isFreeDelivery && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-700">
                    <FaTruck style={{ color: primary }} /> ফ্রি ডেলিভারি
                  </span>
                )}
              </div>
            )}

            {description && (
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">{description}</p>
            )}

            {/* ============ OPTIONS (data-driven) ============ */}
            <div className="mt-5 space-y-5 border-t border-gray-100 pt-5">
              {selection.groups.map(({ name: key, options }) => {
                const chosen = selection.selectedAttributes[key];
                const isColorKey = /colou?r/i.test(key);

                // colorCode from backend applies to the color attribute only
                const colorFor = (value: string): string | null =>
                  isColorKey && options.length === 1 && activeVariant?.colorCode
                    ? activeVariant.colorCode
                    : toCssColor(value);

                const isColorGroup = options.every((o) => !!colorFor(o));

                const pick = (value: string) => {
                  selection.selectAttribute(key, value);
                  if (isColorGroup) onColorChange?.(value);
                };

                const available = selection.isAvailable();

                return (
                  <div key={key}>
                    <SectionHead
                      icon={isColorGroup ? <FaPalette /> : <FaTag />}
                      label={labelOf(key)}
                      value={isColorGroup ? chosen : undefined}
                      needed={!chosen}
                      primary={primary}
                      primaryLight={primaryLight}
                    />

                    {options.length > MANY_OPTIONS ? (
                      <select
                        value={chosen || ""}
                        onChange={(e) => e.target.value && pick(e.target.value)}
                        disabled={!available}
                        className="h-12 w-full rounded-2xl border-2 bg-white px-4 text-sm text-slate-900 focus:outline-none"
                        style={{ borderColor: chosen ? primary : "#E5E7EB" }}
                      >
                        <option value="" disabled>
                          বাছাই করুন
                        </option>
                        {options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : isColorGroup ? (
                      <div className="flex flex-wrap gap-3 pl-1">
                        {options.map((value) => {
                          const isSelected = chosen === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => pick(value)}
                              disabled={!available}
                              aria-label={`${labelOf(key)}: ${value}`}
                              aria-pressed={isSelected}
                              title={value}
                              className={`h-10 w-10 rounded-full border border-gray-200 transition-transform ${
                                available ? "hover:scale-110" : "cursor-not-allowed opacity-40"
                              }`}
                              style={{
                                background: colorFor(value) || undefined,
                                outline: isSelected ? `2px solid ${primary}` : "none",
                                outlineOffset: "2px",
                              }}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2.5">
                        {options.map((value) => {
                          const isSelected = chosen === value;
                          const dot = toCssColor(value);
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => pick(value)}
                              disabled={!available}
                              aria-pressed={isSelected}
                              className={`inline-flex h-12 min-w-[72px] items-center justify-center gap-2 rounded-2xl border-2 px-6 text-base transition-all ${
                                available ? "" : "cursor-not-allowed line-through opacity-40"
                              } ${
                                isSelected
                                  ? "border-transparent font-bold text-white"
                                  : "border-gray-200 bg-white font-semibold text-slate-800 hover:border-gray-400"
                              }`}
                              style={isSelected ? { background: gradient } : undefined}
                            >
                              {dot && (
                                <span
                                  className="h-3 w-3 rounded-full border border-black/10"
                                  style={{ background: dot }}
                                />
                              )}
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Quantity */}
              <div>
                <SectionHead
                  icon={<FaBox />}
                  label="পরিমাণ"
                  value={unit ? `(${unit})` : undefined}
                  primary={primary}
                  primaryLight={primaryLight}
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex h-12 items-center overflow-hidden rounded-2xl border-2 border-gray-200 bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity(roundToStep(Math.max(QUANTITY_STEP, quantity - QUANTITY_STEP)))}
                      aria-label="কমান"
                      className="flex h-full w-14 items-center justify-center text-slate-700 hover:bg-gray-50"
                    >
                      <FaMinus className="text-sm" />
                    </button>
                    <input
                      type="number"
                      min={QUANTITY_STEP}
                      step={QUANTITY_STEP}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(roundToStep(Math.max(QUANTITY_STEP, Number(e.target.value) || QUANTITY_STEP)))
                      }
                      className="h-full w-16 text-center font-bold text-black focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(roundToStep(Math.min(activeVariant?.stock || 99, quantity + QUANTITY_STEP)))
                      }
                      aria-label="বাড়ান"
                      className="flex h-full w-14 items-center justify-center text-slate-700 hover:bg-gray-50"
                    >
                      <FaPlus className="text-sm" />
                    </button>
                  </div>

                  {activeVariant && quantity !== 1 && (
                    <span className="text-sm text-gray-900">
                      মোট <span className="text-lg font-extrabold text-slate-900">৳{total.toFixed(0)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ============ ACTIONS ============ */}
            <div className="mt-6">
              {activeVariant && !outOfStock && missing.length > 0 && (
                <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">
                  অর্ডার করতে {missing.map((g) => labelOf(g.name)).join(", ")} বাছাই করুন
                </div>
              )}
              {!activeVariant && (
                <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">
                  একটি পণ্য নির্বাচন করুন
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (canBuy) addToCart(activeVariant.id, quantity, selection.selectedAttributes);
                }}
                disabled={!canBuy || cartBusy}
                className={`flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl text-base font-bold transition-all ${
                  canBuy ? "text-white" : "cursor-not-allowed bg-gray-200 text-gray-500"
                }`}
                style={canBuy ? { background: gradient } : undefined}
              >
                <FaShoppingCart />
                {cartBusy ? "..." : outOfStock ? "স্টক শেষ" : "কার্টে যোগ করুন"}
              </button>

              <a
                href={canBuy ? orderNowLink : undefined}
                onClick={() => {
                  if (canBuy && selectedProduct?.id) {
                    onInitiateCheckout?.(selectedProduct.id, quantity);
                  }
                }}
                aria-disabled={!canBuy}
                className={`mt-3 flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl border-2 bg-white text-base font-bold transition-all ${
                  canBuy
                    ? "hover:bg-rose-50 active:scale-[0.985]"
                    : "pointer-events-none cursor-not-allowed border-gray-200 text-gray-400"
                }`}
                style={canBuy ? { borderColor: primary, color: primary } : undefined}
              >
                <FaBolt /> এখনই কিনুন
              </a>

              <a
                href={canBuy ? whatsappVariantLink(selectedLabel) : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!canBuy}
                className={`mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-rose-600 ${
                  !canBuy ? "pointer-events-none opacity-40" : "hover:underline"
                }`}
              >
                <FaWhatsapp className="text-lg" /> হোয়াটসঅ্যাপে অর্ডার করুন
              </a>

              {features.length > 0 && (
                <div className="mt-5 grid grid-cols-1 gap-2 border-t border-gray-100 pt-4 sm:grid-cols-2">
                  {features.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <FaCheck style={{ color: primary, fontSize: "10px", flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}