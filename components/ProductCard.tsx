'use client';

import { useMemo, useState, useCallback, type MouseEvent, type KeyboardEvent } from 'react';
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
  onAddToCart?: (variantId: string, qty?: number, attrs?: Record<string, string>) => void;
  onBuyNow?: (variantId: string, qty?: number, attrs?: Record<string, string>) => void;
  onToggleWishlist?: (variantId: string) => void;
  isWishlisted?: (variantId: string) => boolean;
  onOpenDetails?: (productId: string, variantId: string) => void;
  cartLoading?: boolean;
  className?: string;
}

export default function ProductCard({
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
      if (hasFlatAttrs) {
        return { ...pv, attributes: normalizeAttributes(pv.attributes as unknown as Record<string, unknown>, product.name) };
      }
      return toPublicVariant(v as Variant);
    }).map((v) => ({ ...v, attributes: normalizeAttributes(v.attributes as unknown as Record<string, unknown>, product.name) }));
  }, [product.variants, product.name]);

  const options = useMemo(() => getAttributeOptions(variants, product.name), [variants, product.name]);
  const optionKeys = useMemo(() => Object.keys(options), [options]);
  const visibleKeys = useMemo(
    () => optionKeys.filter((k) => (options[k] || []).length > 1).slice(0, 2),
    [optionKeys, options],
  );
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
  const outOfStock = !activeVariant || (activeVariant.stock ?? 0) <= 0;
  const displayImage = activeVariant?.image || (product.images && product.images[0]) || null;
  const wished = isWishlisted ? isWishlisted(activeVariant?.id || '') : false;
  const attrsForAction = useMemo(
    () => normalizeAttributes(activeVariant?.attributes as unknown as Record<string, unknown>, product.name),
    [activeVariant, product.name],
  );

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
      className={`w-full bg-white border border-gray-200/80 rounded-lg sm:rounded-md overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow ${className || ''}`}
    >
      <div className="relative aspect-square bg-gray-50">
        {displayImage ? (
          <img src={displayImage} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs sm:text-sm">ছবি নেই</div>
        )}
        {discount > 0 && (
          <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 bg-red-600 text-white text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full leading-none">
            -{discount}%
          </div>
        )}
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            if (onToggleWishlist && activeVariant) onToggleWishlist(activeVariant.id);
          }}
          onKeyDown={stop}
          className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/95 border border-gray-200 flex items-center justify-center shadow-sm"
          aria-label="wishlist"
        >
          {wished ? <FaHeart className="text-red-500 text-[11px] sm:text-xs" /> : <FaRegHeart className="text-gray-500 text-[11px] sm:text-xs" />}
        </button>
      </div>

      <div className="p-1.5 sm:p-3 flex flex-col gap-1 sm:gap-1.5 flex-1">
        <h3 className="text-[13px] sm:text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.1rem] sm:min-h-[2.5rem] leading-[1.3] tracking-[0.01em]">{product.name}</h3>

        {visibleKeys.length > 0 && variants.length > 1 && (
          <div className="space-y-0.5 sm:space-y-1">
            {visibleKeys.map((key) => (
              <div key={key} className="flex items-center gap-1 min-w-0">
                <span className="text-[9px] sm:text-[10px] text-gray-400 shrink-0">{key}:</span>
                <div className="flex gap-0.5 sm:gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide min-w-0" style={{ scrollbarWidth: 'none' }}>
                  {(options[key] || []).map((val) => {
                    const isSelected = selected[key] === val;
                    const available = isOptionAvailable(variants, selected, key, val, product.name);
                    return (
                      <button
                        key={val}
                        type="button"
                        disabled={!available}
                        onClick={(e) => handleSelect(key, val, e)}
                        onKeyDown={stop}
                        className={`shrink-0 h-6 min-h-[24px] sm:h-8 sm:min-h-[32px] px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full border transition-colors leading-none ${
                          isSelected
                            ? 'border-red-500 bg-red-50 text-red-600 font-semibold'
                            : available
                              ? 'border-gray-300 bg-white text-gray-700 hover:border-red-300'
                              : 'border-gray-200 bg-gray-50 text-gray-400 line-through opacity-40 cursor-not-allowed'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-0.5">
          <div className="flex items-baseline gap-1 sm:gap-1.5">
            <span className="text-[15px] sm:text-base font-bold text-gray-900 leading-tight">৳{activeVariant.price}</span>
            {activeVariant.compareAtPrice != null && activeVariant.compareAtPrice > activeVariant.price && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through">৳{activeVariant.compareAtPrice}</span>
            )}
          </div>
          <div className={`text-[11px] sm:text-xs mt-0.5 font-medium ${outOfStock ? 'text-red-600' : 'text-green-600'}`}>
            {outOfStock ? 'স্টক নেই' : `স্টক: ${activeVariant.stock}`}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 sm:gap-1.5 mt-0.5">
          <button
            type="button"
            disabled={outOfStock || cartLoading}
            onClick={(e) => {
              stop(e);
              if (onAddToCart && activeVariant) onAddToCart(activeVariant.id, 1, attrsForAction);
            }}
            onKeyDown={stop}
            className="h-8 sm:h-9 flex items-center justify-center gap-0.5 sm:gap-1 text-[11px] sm:text-sm font-semibold rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaShoppingCart className="text-[9px] sm:text-[10px]" /> কার্ট
          </button>
          <button
            type="button"
            disabled={outOfStock}
            onClick={(e) => {
              stop(e);
              if (onBuyNow && activeVariant) onBuyNow(activeVariant.id, 1, attrsForAction);
            }}
            onKeyDown={stop}
            className="h-8 sm:h-9 flex items-center justify-center gap-0.5 sm:gap-1 text-[11px] sm:text-sm font-bold rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaBolt className="text-[9px] sm:text-[10px]" /> কিনুন
          </button>
        </div>
      </div>
    </div>
  );
}
