'use client';

import { memo, useMemo, useState, useCallback, useEffect, useRef, type MouseEvent, type KeyboardEvent } from 'react';
import { FaHeart, FaRegHeart, FaShoppingCart, FaBolt } from 'react-icons/fa';
import type { Variant } from '@/types';
import {
  PublicProduct,
  PublicVariant,
  getAttributeOptions,
  findVariant,
  findBestVariantForSelection,
  isOptionAvailable,
  getDefaultVariant,
  getDiscountPercent,
  normalizeAttributes,
  toPublicVariant,
} from '@/lib/variants';

interface ProductCardProps {
  product: Omit<PublicProduct, 'variants'> & { images?: string[]; name: string; variants: (PublicVariant | Variant)[] };
  onAddToCart?: (variantId: string, qty?: number, attrs?: Record<string, string>) => void | Promise<unknown>;
  onBuyNow?: (variantId: string, qty?: number, attrs?: Record<string, string>) => void;
  onToggleWishlist?: (variantId: string) => void;
  isWishlisted?: (variantId: string) => boolean;
  onOpenDetails?: (productId: string, variantId: string) => void;
  cartLoading?: boolean;
  className?: string;
}

const LOW_STOCK_THRESHOLD = 5;

const chipBase =
  'rounded-md border text-center leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1';

const chipState = (isSelected: boolean, available: boolean) =>
  isSelected
    ? 'border-[var(--primary,#e11d48)] bg-[var(--primary,#e11d48)] text-white'
    : available
      ? 'border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200/70'
      : 'border-transparent bg-gray-100 text-gray-400 line-through opacity-50 cursor-not-allowed';

function ProductCard({
  product,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  onOpenDetails,
  cartLoading,
  className,
}: ProductCardProps) {
  const variants: PublicVariant[] = useMemo(() => {
    const raw = (product.variants || []) as Array<PublicVariant | Variant>;
    return raw.map((v) => {
      const pv = v as PublicVariant;
      const hasFlatAttrs = pv.attributes && typeof pv.attributes === 'object' && !Array.isArray(pv.attributes);
      const base = hasFlatAttrs ? pv : toPublicVariant(v as Variant);
      return { ...base, attributes: normalizeAttributes(base.attributes as unknown as Record<string, unknown>, product.name) };
    });
  }, [product.variants, product.name]);

  const options = useMemo(() => getAttributeOptions(variants, product.name), [variants, product.name]);
  const visibleKeys = useMemo(() => Object.keys(options).slice(0, 2), [options]);
  const defaultVariant = useMemo(() => getDefaultVariant(variants), [variants]);

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    if (defaultVariant) return normalizeAttributes(defaultVariant.attributes as unknown as Record<string, unknown>, product.name);
    return {};
  });

  const activeVariant = useMemo(() => {
    const match = findVariant(variants, selected, product.name);
    if (match) return match;
    return defaultVariant || variants[0];
  }, [variants, selected, defaultVariant, product.name]);

  const discount = getDiscountPercent(activeVariant);
  const stock = activeVariant?.stock ?? 0;
  const outOfStock = !activeVariant || stock <= 0;
  const lowStock = !outOfStock && stock <= LOW_STOCK_THRESHOLD;
  const isPreOrder = !!(activeVariant as any)?.isPreOrder || !!(activeVariant as any)?.preOrderPrice;
  const preOrderPrice = (activeVariant as any)?.preOrderPrice;
  const displayImage = activeVariant?.image || (product.images && product.images[0]) || null;
  const wished = isWishlisted ? isWishlisted(activeVariant?.id || '') : false;
  const attrsForAction = useMemo(
    () => normalizeAttributes(activeVariant?.attributes as unknown as Record<string, unknown>, product.name),
    [activeVariant, product.name],
  );

  const hasCompare =
    activeVariant?.compareAtPrice != null && activeVariant.compareAtPrice > activeVariant.price;
  const showVariants = visibleKeys.length > 0 && variants.length > 1;

  const mergedChips = useMemo(() => {
    const allSingle = variants.length > 0 && variants.every((v) => Object.keys(v.attributes || {}).length <= 1);
    if (!allSingle) return null;
    const seen = new Set<string>();
    const chips: { key: string; val: string; variant: PublicVariant }[] = [];
    for (const v of variants) {
      const entry = Object.entries(v.attributes || {})[0];
      if (!entry) continue;
      const id = `${entry[0]}::${entry[1]}`;
      if (seen.has(id)) continue;
      seen.add(id);
      chips.push({ key: entry[0], val: String(entry[1]), variant: v });
    }
    return chips.length > 1 ? chips : null;
  }, [variants]);

  const [adding, setAdding] = useState(false);
  const waitingForProp = useRef(false);
  const sawLoading = useRef(false);

  useEffect(() => {
    if (!waitingForProp.current) return;
    if (cartLoading) {
      sawLoading.current = true;
    } else if (sawLoading.current) {
      waitingForProp.current = false;
      sawLoading.current = false;
      setAdding(false);
    }
  }, [cartLoading]);

  const handleAddToCart = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!onAddToCart || !activeVariant || adding) return;
    setAdding(true);
    try {
      const result = onAddToCart(activeVariant.id, 1, attrsForAction);
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        await result;
        setAdding(false);
      } else {
        waitingForProp.current = true;
        sawLoading.current = false;
        setTimeout(() => {
          if (!sawLoading.current && waitingForProp.current) {
            waitingForProp.current = false;
            setAdding(false);
          }
        }, 800);
      }
    } catch {
      setAdding(false);
    }
  };

  const stop = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation();
  };

  const openDetails = useCallback(() => {
    if (!activeVariant) return;
    onOpenDetails?.(product.id, activeVariant.id);
  }, [onOpenDetails, product.id, activeVariant]);

  const handleSelect = useCallback((key: string, val: string, e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelected((prev) => {
      const next = { ...prev, [key]: val };
      const match = findVariant(variants, next, product.name);
      if (match) return normalizeAttributes(match.attributes as unknown as Record<string, unknown>, product.name);
      const best = findBestVariantForSelection(variants, prev, key, val, product.name);
      if (best) return normalizeAttributes(best.attributes as unknown as Record<string, unknown>, product.name);
      return next;
    });
  }, [variants, product.name]);

  if (!activeVariant) return null;

  const stockLabel = outOfStock ? 'স্টক শেষ' : lowStock ? `মাত্র ${stock}টি বাকি` : 'স্টকে আছে';
  const stockColor = outOfStock ? 'text-red-600' : lowStock ? 'text-amber-600' : 'text-green-600';

  const buttonDisabled = outOfStock || adding;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDetails();
        }
      }}
      className={`w-full h-full bg-white border-[#e7e8ec] rounded-xl overflow-hidden flex flex-col cursor-pointer shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary,#e11d48)] ${className || ''}`}
    >
      <div className="relative aspect-square bg-gray-50">
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className={`w-full h-full object-cover ${outOfStock ? 'opacity-55' : ''} ${isPreOrder ? 'opacity-95' : ''}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">পণ্যের ছবি</div>
        )}
        <span className="absolute top-2 left-2 z-10 rounded-md px-2 py-0.5 text-[10px] font-bold leading-none">
          {isPreOrder ? (
            <span className="bg-amber-100 text-amber-800 border border-amber-200">প্রি-অর্ডার</span>
          ) : discount > 0 && !outOfStock ? (
            <span className="bg-[var(--primary,#e11d48)] text-white border border-[var(--primary,#e11d48)]">-{discount}%</span>
          ) : outOfStock ? (
            <span className="bg-gray-100 text-gray-600 border border-gray-200">স্টক শেষ</span>
          ) : (
            <span className="bg-[var(--primary,#e11d48)] text-white border border-[var(--primary,#e11d48)]">নতুন</span>
          )}
        </span>
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            if (onToggleWishlist && activeVariant) onToggleWishlist(activeVariant.id);
          }}
          onKeyDown={stop}
          className="absolute top-2 right-2 z-10 h-[34px] w-[34px] rounded-full bg-white/95 border border-gray-200 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          aria-label={wished ? 'উইশলিস্ট থেকে সরান' : 'উইশলিস্টে যোগ করুন'}
          aria-pressed={wished}
        >
          {wished ? <FaHeart className="text-red-500 text-[14px]" /> : <FaRegHeart className="text-gray-500 text-[14px]" />}
        </button>
      </div>
      <div className="p-3 pb-4 flex flex-col gap-2 flex-1">
        <h3 className="text-[14px] font-semibold text-[#17181c] line-clamp-2 min-h-[2.4rem] leading-tight break-words">
          {product.name}
        </h3>
        {showVariants && (
          mergedChips ? (
            <div>
              <div className="flex flex-wrap gap-1.5">
                {mergedChips.map(({ key, val, variant }) => {
                  const isSelected = attrsForAction[key] === val;
                  const available = (variant.stock ?? 0) > 0 || isSelected;
                  return (
                    <button
                      key={`${key}-${val}`}
                      type="button"
                      disabled={!available}
                      aria-pressed={isSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setSelected(normalizeAttributes(variant.attributes as unknown as Record<string, unknown>, product.name));
                      }}
                      onKeyDown={stop}
                      className={`${chipBase} ${chipState(isSelected, available)} min-h-[30px] px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {visibleKeys.map((key) => (
                <div key={key} className="flex items-start gap-2 min-w-0">
                  <span className="text-[11px] text-gray-500 shrink-0 min-w-[2.5rem] pt-1.5">{key}</span>
                  <div className="flex flex-wrap gap-1.5 min-w-0">
                    {(options[key] || []).map((val) => {
                      const isSelected = selected[key] === val;
                      const available = isOptionAvailable(variants, selected, key, val, product.name);
                      return (
                        <button
                          key={val}
                          type="button"
                          disabled={!available}
                          aria-pressed={isSelected}
                          onClick={(e) => handleSelect(key, val, e)}
                          onKeyDown={stop}
                          className={`${chipBase} ${chipState(isSelected, available)} min-h-[28px] px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
        <div className="mt-auto flex items-baseline justify-between gap-2 min-w-0">
          <div className="flex items-baseline flex-wrap gap-x-1.5 min-w-0">
            <span className="text-[18px] font-semibold text-[#17181c] leading-none">৳{isPreOrder && preOrderPrice != null ? preOrderPrice : activeVariant.price}</span>
            {hasCompare && (
              <span className="text-[13px] text-gray-500 line-through">৳{activeVariant.compareAtPrice}</span>
            )}
          </div>
          <span className={`text-[11px] font-semibold shrink-0 ${stockColor}`}>{stockLabel}</span>
        </div>
        {isPreOrder ? (
          <button
            type="button"
            disabled={buttonDisabled}
            onClick={handleAddToCart}
            onKeyDown={stop}
            className="w-full h-[42px] flex items-center justify-center gap-1.5 text-[14px] font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-600"
          >
            {adding ? (
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden="true" />
            ) : (
              <FaBolt className="text-[13px]" />
            )}
            প্রি-অর্ডার করুন
          </button>
        ) : (
          <div className="grid grid-cols-[38%_62%] gap-2">
            <button
              type="button"
              disabled={buttonDisabled}
              onClick={handleAddToCart}
              onKeyDown={stop}
              className="h-[42px] flex items-center justify-center gap-1.5 text-[14px] font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary,#e11d48)]"
            >
              {adding ? (
                <span className="h-4 w-4 rounded-full border-2 border-gray-500 border-t-transparent animate-spin" aria-hidden="true" />
              ) : (
                <FaShoppingCart className="text-[13px]" />
              )}
              কার্ট
            </button>
            <button
              type="button"
              disabled={buttonDisabled}
              onClick={(e) => {
                stop(e);
                if (onBuyNow && activeVariant) onBuyNow(activeVariant.id, 1, attrsForAction);
              }}
              onKeyDown={stop}
              className="h-[42px] flex items-center justify-center gap-1.5 text-[14px] font-bold rounded-lg bg-[var(--primary,#e11d48)] text-white hover:bg-[var(--primary-dark,#be123c)] active:bg-[var(--primary-dark,#be123c)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary,#e11d48)]"
            >
              <FaBolt className="text-[13px]" /> অর্ডার করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ProductCard);
