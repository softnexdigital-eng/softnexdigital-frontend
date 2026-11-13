"use client";

import { useEffect, useMemo, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import type { Variant, Product } from "@/types";
import {
  getAttributeOptions,
  normalizeAttributes,
  findBestVariantForSelection,
  isOptionAvailable,
  getDefaultVariant,
  type PublicVariant,
} from "@/lib/variants";

interface VariantExtras {
  colorCode?: string | null;
  variantImages?: Array<{ url: string }>;
  compareAtPrice?: number | null;
  unit?: string;
  sku?: string;
  productId?: string;
}

type HVariant = Variant & VariantExtras;
type HProduct = Product & { unit?: string; attributeLabels?: Record<string, string>; variants?: HVariant[] };

interface HeroData {
  product?: HProduct;
  name?: string;
  description?: string;
  variants?: HVariant[];
  tenant?: { attributeLabels?: Record<string, string> } & Record<string, unknown>;
}

interface TrustBarItem {
  value: string;
  label: string;
}

interface HeroSectionProps {
  selectedVariant: Variant | null;
  selectedProduct: Product | null;
  data: HeroData | null;
  variants?: Variant[];
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
  trustBar: TrustBarItem[];
  features: string[];
  variantDetails: string[];
  badge: string;
  tagline: string;
  addToCart: (id: string, qty?: number, attrs?: Record<string, string>) => void;
  onInitiateCheckout?: (productId: string, quantity: number) => void;
  updateVariantAndProduct: (v: Variant) => void;
  switchVariant?: (v: Variant) => void;
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
  onVariantAttrsChange?: (attrs: { [key: string]: string }) => void;
  onVariantChange?: (variant: Variant | null, attrs: { [key: string]: string }) => void;
}

const NOT_COLORS = new Set(["inherit", "initial", "unset", "revert", "transparent", "currentcolor"]);
const toCssColor = (value: string): string | null => {
  const s = String(value).trim();
  if (!s || NOT_COLORS.has(s.toLowerCase())) return null;
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return null;
  return CSS.supports("color", s) ? s : null;
};

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
  addToCart,
  onInitiateCheckout,
  updateVariantAndProduct,
  switchVariant,
  toggleWishlist,
  cartLoadingItems,
  wishlistIds,
  isFreeDelivery,
  formatBanglaNum,
  badge,
  tagline,
  primary,
  primaryDark,
  primaryMuted,
  primaryLight,
  orderNowLink,
  whatsappVariantLink,
  heroWishlistBtnClass,
  onColorChange,
  onVariantAttrsChange,
  onVariantChange,
}: HeroSectionProps) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const storeSlug = typeof params.slug === "string" ? params.slug : "";

  const allVariants = (propVariants || data?.variants || []) as HVariant[];
  const productVariants = useMemo(() => {
    const p = selectedProduct as HProduct | null;
    if (p?.variants && Array.isArray(p.variants) && p.variants.length > 0) {
      return p.variants as HVariant[];
    }
    if (p?.id) {
      const filtered = allVariants.filter((v) => v.productId === p.id);
      if (filtered.length > 0) return filtered;
    }
    return allVariants;
  }, [selectedProduct, allVariants]);

  const name = selectedProduct?.name || data?.product?.name || data?.name || "";
  const description = selectedProduct?.description || data?.product?.description || data?.description || "";

  const pvVariants = useMemo(
    () => productVariants.map((v) => ({ ...v, attributes: normalizeAttributes(v.attributes as unknown as Record<string, unknown>, name) } as PublicVariant)),
    [productVariants, name],
  );
  const options = useMemo(() => getAttributeOptions(pvVariants, name), [pvVariants, name]);
  const optionKeys = useMemo(() => Object.keys(options), [options]);
  const showChips = productVariants.length > 1 && optionKeys.length > 0;

  const defaultVariant = useMemo(() => getDefaultVariant(pvVariants) as HVariant | undefined, [pvVariants]);
  const activeVariant = useMemo(() => {
    const sel = selectedVariant as HVariant | null;
    if (sel && productVariants.some((v) => v.id === sel.id)) return sel;
    return defaultVariant || productVariants[0] || null;
  }, [selectedVariant, productVariants, defaultVariant]);

  const selectedAttrs = useMemo(
    () => normalizeAttributes(activeVariant?.attributes as unknown as Record<string, unknown>, name),
    [activeVariant, name],
  );

  const labelOf = (key: string): string =>
    (selectedProduct as HProduct | null)?.attributeLabels?.[key] ||
    data?.tenant?.attributeLabels?.[key] ||
    key;

  const lastNotifiedVariantRef = useRef<string | null>(null);
  useEffect(() => {
    if (!activeVariant) return;
    if (lastNotifiedVariantRef.current === activeVariant.id) return;
    lastNotifiedVariantRef.current = activeVariant.id;
    onVariantAttrsChange?.(selectedAttrs);
  }, [activeVariant, selectedAttrs, onVariantAttrsChange]);

  const pick = (key: string, value: string) => {
    if (!productVariants.length) return;
    const target = findBestVariantForSelection(pvVariants, selectedAttrs, key, value, name) as HVariant | undefined;
    if (!target) return;
    updateVariantAndProduct(target);
    if (onColorChange && /colou?r/i.test(key)) onColorChange(value);
    const attrs = normalizeAttributes(target.attributes as unknown as Record<string, unknown>, name);
    onVariantChange?.(target, attrs);
    onVariantAttrsChange?.(attrs);
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("variant", target.id);
    router.replace(`/${storeSlug}?${sp.toString()}`, { scroll: false });
  };

  const handleGalleryImageClick = (img: string, idx: number) => {
    const matchingVariant = productVariants.find((v) => {
      if (v.image === img) return true;
      if (v.variantImages && Array.isArray(v.variantImages)) {
        return v.variantImages.some((vi) => vi.url === img);
      }
      return false;
    });
    if (matchingVariant && (matchingVariant.stock ?? 0) > 0) {
      (switchVariant || updateVariantAndProduct)(matchingVariant);
    } else if (matchingVariant) {
      return;
    } else {
      setActiveGallery(idx);
    }
  };

  const thumbsRef = useRef<HTMLDivElement>(null);
  const scrollThumbs = () => thumbsRef.current?.scrollBy({ top: 96, behavior: "smooth" });

  const selectedLabel = Object.values(selectedAttrs).filter(Boolean).join(" / ");
  const price: number = activeVariant?.price ?? 0;
  const compareAt: number = activeVariant?.compareAtPrice ?? 0;
  const discountPct = compareAt > price && price > 0 ? Math.round((1 - price / compareAt) * 100) : 0;
  const outOfStock = !!activeVariant && (activeVariant.stock ?? 0) <= 0;
  const lowStock = !!activeVariant && (activeVariant.stock ?? 0) > 0 && (activeVariant.stock ?? 0) <= 5;
  const total = price * quantity;
  const wishlisted = !!activeVariant && wishlistIds.has(activeVariant.id);
  const cartBusy = cartLoadingItems.has(activeVariant?.id || "");
  const canBuy = !!activeVariant && (activeVariant.stock ?? 0) > 0;
  const gradient = `linear-gradient(135deg, ${primary}, ${primaryDark})`;
  const unit: string = activeVariant?.unit || (selectedProduct as HProduct | null)?.unit || data?.product?.unit || "";

  return (
    <div className="[&_*]:[text-shadow:none] [&_*]:!shadow-none">
      {trustBar.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-4">
          {trustBar.map((s, i) => (
            <div key={i} className="bg-white px-4 py-3 text-center">
              <div className="text-sm font-bold text-gray-900">{s.value}</div>
              <div className="text-[11px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-gray-100 bg-white p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-8">
          <div className="flex min-w-0 flex-col gap-3 md:flex-row md:gap-4">
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
                      style={{ borderColor: activeGallery === i ? primary : "transparent" }}
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

            <div className="relative aspect-[4/3] w-full min-w-0 overflow-hidden rounded-2xl bg-gray-50 md:aspect-[4/5] md:flex-1">
              {productImage ? (
                <img src={allImages[activeGallery] || productImage} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FaLeaf className="text-6xl text-gray-300" />
                </div>
              )}

              <button
                type="button"
                onClick={() => { if (activeVariant) toggleWishlist(activeVariant.id); }}
                disabled={!activeVariant}
                aria-label="উইশলিস্ট"
                aria-pressed={wishlisted}
                className={`absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white transition-transform hover:scale-105 md:left-auto md:right-3 ${heroWishlistBtnClass}`}
              >
                {wishlisted ? <FaHeart className="text-lg text-rose-500" /> : <FaRegHeart className="text-lg text-slate-700" />}
              </button>

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

          <div className="flex min-w-0 flex-col">
            {badge && (
              <div className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: primaryLight, color: primary }}>
                <FaAward className="text-[10px]" /> {badge}
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">{name}</h1>
                {tagline && <p className="mt-0.5 text-sm text-gray-500">{tagline}</p>}
                {activeVariant && (
                  <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-4xl font-extrabold leading-none sm:text-5xl" style={{ color: primary }}>৳{price.toFixed(0)}</span>
                    {unit && <span className="text-sm text-gray-500">/ {unit}</span>}
                    {compareAt > price && <span className="text-base text-gray-400 line-through">৳{compareAt.toFixed(0)}</span>}
                    {discountPct > 0 && <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600">-{formatBanglaNum(discountPct)}%</span>}
                  </div>
                )}
              </div>

              {activeVariant && (
                <span
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold"
                  style={outOfStock ? { background: primaryLight, color: primaryDark } : lowStock ? { background: primaryLight, color: primaryDark } : { background: primaryLight, color: primary }}
                >
                  <FaShieldAlt />
                  {outOfStock ? "স্টক শেষ" : lowStock ? `মাত্র ${formatBanglaNum(activeVariant.stock ?? 0)} বাকি` : "স্টকে আছে"}
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
                {isFreeDelivery && <span className="inline-flex items-center gap-1.5 text-xs text-gray-700"><FaTruck style={{ color: primary }} /> ফ্রি ডেলিভারি</span>}
              </div>
            )}

            {description && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">{description}</p>}

            <div className="mt-5 space-y-5 border-t border-gray-100 pt-5">
              {showChips && optionKeys.map((key) => {
                const opts = options[key] || [];
                const chosen = selectedAttrs[key];
                const isColorGroup = opts.length > 0 && opts.every((o) => !!toCssColor(o));
                return (
                  <div key={key}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs" style={{ background: primaryLight, color: primary }}>
                        {isColorGroup ? <FaPalette /> : <FaTag />}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{labelOf(key)}</span>
                      {chosen && <span className="text-xs text-gray-500">: {chosen}</span>}
                    </div>
                    {isColorGroup ? (
                      <div className="flex flex-wrap gap-3 pl-1">
                        {opts.map((value) => {
                          const isSelected = chosen === value;
                          const color = toCssColor(value);
                          const available = isOptionAvailable(pvVariants, selectedAttrs, key, value, name);
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => pick(key, value)}
                              disabled={!available}
                              aria-label={`${labelOf(key)}: ${value}`}
                              aria-pressed={isSelected}
                              title={value}
                              className={`h-10 w-10 rounded-full border border-gray-200 transition-transform ${!available ? "opacity-40 cursor-not-allowed line-through" : "hover:scale-110"}`}
                              style={{ background: color || undefined, outline: isSelected ? `2px solid ${primary}` : "none", outlineOffset: "2px" }}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2.5">
                        {opts.map((value) => {
                          const isSelected = chosen === value;
                          const available = isOptionAvailable(pvVariants, selectedAttrs, key, value, name);
                          const dot = toCssColor(value);
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => pick(key, value)}
                              disabled={!available}
                              aria-pressed={isSelected}
                              className={`inline-flex h-12 min-w-[72px] items-center justify-center gap-2 rounded-2xl border-2 px-6 text-base transition-all ${!available ? "opacity-40 cursor-not-allowed line-through" : ""} ${isSelected ? "border-transparent font-bold text-white" : "border-gray-200 bg-white font-semibold text-slate-800 hover:border-gray-400"}`}
                              style={isSelected ? { background: gradient } : undefined}
                            >
                              {dot && <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: dot }} />}
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs" style={{ background: primaryLight, color: primary }}><FaBox /></span>
                  <span className="text-sm font-semibold text-slate-800">সংখ্যা</span>
                  {unit && <span className="text-xs text-gray-500">({unit})</span>}
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="inline-flex h-12 items-center overflow-hidden rounded-2xl border-2 border-gray-200 bg-white">
                    <button type="button" onClick={() => setQuantity(roundToStep(Math.max(QUANTITY_STEP, quantity - QUANTITY_STEP)))} aria-label="কমান" className="flex h-full w-14 items-center justify-center text-slate-700 hover:bg-gray-50"><FaMinus className="text-sm" /></button>
                    <input type="number" min={QUANTITY_STEP} step={QUANTITY_STEP} value={quantity} onChange={(e) => setQuantity(roundToStep(Math.max(QUANTITY_STEP, Number(e.target.value) || QUANTITY_STEP)))} className="h-full w-16 text-center font-bold text-black focus:outline-none" />
                    <button type="button" disabled={!activeVariant || (activeVariant.stock ?? 0) <= 0 || quantity >= (activeVariant.stock ?? 0)} onClick={() => setQuantity(roundToStep(Math.min(activeVariant?.stock || 99, quantity + QUANTITY_STEP)))} aria-label="বাড়ান" aria-disabled={!activeVariant || (activeVariant.stock ?? 0) <= 0 || quantity >= (activeVariant.stock ?? 0)} className="flex h-full w-14 items-center justify-center text-slate-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"><FaPlus className="text-sm" /></button>
                  </div>
                  {activeVariant && (activeVariant.stock ?? 0) > 0 && quantity >= (activeVariant.stock ?? 0) && (
                    <span className="text-xs font-semibold text-amber-700">সর্বোচ্চ {formatBanglaNum(activeVariant.stock ?? 0)} টি</span>
                  )}
                  {activeVariant && quantity !== 1 && (
                    <span className="text-sm text-gray-900">মোট <span className="text-lg font-extrabold text-slate-900">৳{total.toFixed(0)}</span></span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              {!activeVariant && (
                <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">একটি পণ্য নির্বাচন করুন</div>
              )}

              <button
                type="button"
                onClick={() => { if (canBuy && activeVariant) addToCart(activeVariant.id, quantity, selectedAttrs); }}
                disabled={!canBuy || cartBusy}
                className={`flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl text-base font-bold transition-all ${canBuy ? "text-white" : "cursor-not-allowed bg-gray-200 text-gray-500"}`}
                style={canBuy ? { background: gradient } : undefined}
              >
                <FaShoppingCart />{cartBusy ? "..." : outOfStock ? "স্টক শেষ" : "কার্টে যোগ করুন"}
              </button>

              <a
                href={canBuy ? orderNowLink : undefined}
                onClick={() => { if (canBuy && selectedProduct?.id) onInitiateCheckout?.(selectedProduct.id, quantity); }}
                aria-disabled={!canBuy}
                className={`mt-3 flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl border-2 bg-white text-base font-bold transition-all ${canBuy ? "hover:bg-rose-50 active:scale-[0.985]" : "pointer-events-none cursor-not-allowed border-gray-200 text-gray-400"}`}
                style={canBuy ? { borderColor: primary, color: primary } : undefined}
              >
                <FaBolt /> এখনই কিনুন
              </a>

              <a
                href={canBuy ? whatsappVariantLink(selectedLabel) : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!canBuy}
                className={`mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-rose-600 ${!canBuy ? "pointer-events-none opacity-40" : "hover:underline"}`}
              >
                <FaWhatsapp className="text-lg" /> হোয়াটসঅ্যাপে অর্ডার করুন
              </a>

              {features.length > 0 && (
                <div className="mt-5 grid grid-cols-1 gap-2 border-t border-gray-100 pt-4 sm:grid-cols-2">
                  {features.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <FaCheck style={{ color: primary, fontSize: "10px", flexShrink: 0 }} />{item}
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