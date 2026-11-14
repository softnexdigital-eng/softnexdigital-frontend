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
  'rounded-lg border text-center leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500';
const chipState = (isSelected: boolean, available: boolean) =>
  isSelected
    ? 'border-red-500 bg-red-50 text-gray-900'
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
  const displayImage = activeVariant?.image || (product.images && product.images[0]) || null;
  const wished = isWishlisted ? isWishlisted(activeVariant?.id || '') : false;
  const attrsForAction = useMemo(
    () => normalizeAttributes(activeVariant?.attributes as unknown as Record<string, unknown>, product.name),
    [activeVariant, product.name],
  );

  const hasCompare =
    activeVariant?.compareAtPrice != null && activeVariant.compareAtPrice > activeVariant.price;
  const showVariants = visibleKeys.length > 0 && variants.length > 1;

  // When every variant carries only ONE attribute (e.g. some are "Gram", some "KG"),
  // they are really a single choice, so show them together in one compact row.
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
  // Per-card "adding" state. `cartLoading` is one shared flag from the parent, so using it
  // directly would show a spinner on EVERY card. Here only the card that was clicked reacts:
  //  - if onAddToCart returns a Promise, we wait for it;
  //  - otherwise we follow the parent's `cartLoading` flag, but only for this card.
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
        // Handler is not async: follow the parent's cartLoading flag; give up if it never starts.
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

  const stockLabel = outOfStock ? 'স্টক নেই' : lowStock ? `মাত্র ${stock}টি বাকি` : 'স্টকে আছে';
  const stockColor = outOfStock ? 'text-red-600' : lowStock ? 'text-amber-600' : 'text-green-600';

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
      className={`w-full h-full bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col cursor-pointer shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${className || ''}`}
    >
      {/* Image */}
      <div className="relative aspect-[3/2] bg-gray-50">
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className={`w-full h-full object-cover ${outOfStock ? 'opacity-60' : ''}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">ছবি নেই</div>
        )}

        {discount > 0 && !outOfStock && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded-full leading-none">
            -{discount}%
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            stop(e);
            if (onToggleWishlist && activeVariant) onToggleWishlist(activeVariant.id);
          }}
          onKeyDown={stop}
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/95 border border-gray-200 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wished}
        >
          {wished ? <FaHeart className="text-red-500 text-xs" /> : <FaRegHeart className="text-gray-500 text-xs" />}
        </button>
      </div>

      {/* Content */}
      <div className="p-2 flex flex-col gap-1.5 flex-1">
        <h3 className="text-[13px] font-semibold text-gray-900 line-clamp-2 min-h-[2.1rem] leading-tight break-words">
          {product.name}
        </h3>

        {/* Variant selector */}
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
                      className={`${chipBase} ${chipState(isSelected, available)} min-h-[30px] px-2 py-1`}
                    >
                      <span className="flex items-baseline justify-center gap-1 whitespace-nowrap">
                        <span className="text-xs font-semibold">{val}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-red-600' : 'text-gray-500'}`}>৳{variant.price}</span>
                      </span>
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

        {/* Price + stock (one line) */}
        <div className="mt-auto flex items-baseline justify-between gap-2">
          <div className="flex items-baseline flex-wrap gap-x-1.5 min-w-0">
            <span className="text-base font-bold text-gray-900 leading-none">৳{activeVariant.price}</span>
            {hasCompare && (
              <span className="text-xs text-gray-400 line-through">৳{activeVariant.compareAtPrice}</span>
            )}
          </div>
          <span className={`text-[11px] font-semibold shrink-0 ${stockColor}`}>{stockLabel}</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-[1fr_1.5fr] gap-2">
          <button
            type="button"
            disabled={outOfStock || adding}
            onClick={handleAddToCart}
            onKeyDown={stop}
            className="h-8 flex items-center justify-center gap-1.5 text-[13px] font-medium rounded-lg border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            {adding ? (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-gray-500 border-t-transparent animate-spin" aria-hidden />
            ) : (
              <FaShoppingCart className="text-xs" />
            )}
            Cart
          </button>
          <button
            type="button"
            disabled={outOfStock || adding}
            onClick={(e) => {
              stop(e);
              if (onBuyNow && activeVariant) onBuyNow(activeVariant.id, 1, attrsForAction);
            }}
            onKeyDown={stop}
            className="h-8 flex items-center justify-center gap-1.5 text-[13px] font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
          >
            <FaBolt className="text-xs" /> Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);