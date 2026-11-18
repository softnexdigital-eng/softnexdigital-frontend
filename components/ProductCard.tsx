'use client';

import { memo, useMemo, useState, useCallback, useEffect, useRef, type MouseEvent, type KeyboardEvent } from 'react';
import { FaHeart, FaRegHeart, FaBolt } from 'react-icons/fa';
import { MdAddShoppingCart } from 'react-icons/md';
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

/* ---------- Theme-based class helpers ---------- */
const P = 'var(--primary,#e11d48)';
const PD = 'var(--primary-dark,#be123c)';

const focusRing = `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[${P}] focus-visible:ring-offset-2`;

const shine =
  'relative overflow-hidden before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-full before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-transform before:duration-700 hover:before:translate-x-full';

const btnBase =
  'group/btn flex h-11 items-center justify-center gap-1.5 rounded-lg text-[14px] font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:pointer-events-none disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50';

const btnPrimary = `${btnBase} ${shine} ${focusRing} bg-[${P}] text-white shadow-sm hover:bg-[${PD}] hover:shadow-[0_8px_18px_-6px_${P}] active:shadow-inner`;

const btnOutline = `${btnBase} ${focusRing} border border-[${P}] bg-white text-[${P}] hover:bg-[${P}] hover:text-white hover:shadow-[0_8px_18px_-6px_${P}]`;

const tint = `bg-[color-mix(in_srgb,${P}_10%,white)]`;

const chipClass = (isSelected: boolean, available: boolean) =>
  [
    'min-h-[32px] rounded-full border px-3.5 text-[13px] font-semibold whitespace-nowrap transition-all duration-150 active:scale-95',
    `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[${P}] focus-visible:ring-offset-1`,
    isSelected
      ? `border-[${P}] bg-[${P}] text-white shadow-sm`
      : available
        ? `border-gray-300 bg-white text-gray-800 hover:border-[${P}] hover:text-[${P}]`
        : 'border-gray-200 bg-gray-50 text-gray-300 line-through cursor-not-allowed',
  ].join(' ');

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

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    defaultVariant ? normalizeAttributes(defaultVariant.attributes as unknown as Record<string, unknown>, product.name) : {},
  );

  const activeVariant = useMemo(
    () => findVariant(variants, selected, product.name) || defaultVariant || variants[0],
    [variants, selected, defaultVariant, product.name],
  );

  const discount = getDiscountPercent(activeVariant);
  const stock = activeVariant?.stock ?? 0;
  const outOfStock = !activeVariant || stock <= 0;
  const lowStock = !outOfStock && stock <= LOW_STOCK_THRESHOLD;
  const isPreOrder = !!(activeVariant as any)?.isPreOrder || !!(activeVariant as any)?.preOrderPrice;
  const preOrderPrice = (activeVariant as any)?.preOrderPrice;
  const displayImage = activeVariant?.image || product.images?.[0] || null;
  const wished = isWishlisted ? isWishlisted(activeVariant?.id || '') : false;
  const attrsForAction = useMemo(
    () => normalizeAttributes(activeVariant?.attributes as unknown as Record<string, unknown>, product.name),
    [activeVariant, product.name],
  );

  const hasCompare = activeVariant?.compareAtPrice != null && activeVariant.compareAtPrice > activeVariant.price;
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

  const stop = (e: MouseEvent | KeyboardEvent) => e.stopPropagation();

  const openDetails = useCallback(() => {
    if (!activeVariant) return;
    onOpenDetails?.(product.id, activeVariant.id);
  }, [onOpenDetails, product.id, activeVariant]);

  const handleSelect = useCallback(
    (key: string, val: string, e: MouseEvent) => {
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
    },
    [variants, product.name],
  );

  if (!activeVariant) return null;

  const price = isPreOrder && preOrderPrice != null ? preOrderPrice : activeVariant.price;
  const buttonDisabled = outOfStock || adding;

  const Spinner = ({ dark }: { dark?: boolean }) => (
    <span
      className={`h-4 w-4 animate-spin rounded-full border-2 border-t-transparent ${dark ? `border-[${P}]` : 'border-white'}`}
      aria-hidden="true"
    />
  );

  const statusPill = outOfStock ? (
    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold leading-none text-gray-600">স্টক শেষ</span>
  ) : isPreOrder ? (
    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold leading-none text-amber-800">প্রি-অর্ডার</span>
  ) : lowStock ? (
    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold leading-none text-amber-700">মাত্র {stock}টি বাকি</span>
  ) : null;

  /* -------- Product name with hover/tap reveal tooltip -------- */
  // Tailwind group is already on the outer card; we use a nested group/name
  // so the tooltip only shows when the *name* itself is hovered/focused,
  // keeping the rest of the card interaction untouched.
  const NameWithTooltip = () => {
    const [touchOpen, setTouchOpen] = useState(false);
    const longPressTimer = useRef<number | null>(null);

    const onTouchStart = () => {
      longPressTimer.current = window.setTimeout(() => setTouchOpen(true), 350);
    };
    const clearTimer = () => {
      if (longPressTimer.current) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };
    const onTouchEnd = () => {
      clearTimer();
      // keep open briefly for user to read, then close
      if (touchOpen) window.setTimeout(() => setTouchOpen(false), 2200);
    };

    return (
      <div
        className="group/name relative"
        onMouseEnter={() => {}}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={() => { clearTimer(); setTouchOpen(false); }}
      >
        <h3
          tabIndex={0}
          aria-label={product.name}
          className={`line-clamp-1 break-words text-[16px] font-bold leading-snug text-gray-900 ${focusRing} rounded-md`}
        >
          {product.name}
        </h3>

        {/* Tooltip / full-name reveal */}
        <div
          role="tooltip"
          className={[
            'pointer-events-none absolute left-0 top-full z-30 mt-1.5 w-max max-w-[min(92vw,22rem)]',
            'origin-top-left scale-95 rounded-xl border border-gray-200 bg-white/98 p-2.5 pr-3',
            'text-[13px] font-semibold leading-relaxed text-gray-800 shadow-xl backdrop-blur',
            'whitespace-normal break-words opacity-0 transition-all duration-200',
            'group-hover/name:scale-100 group-hover/name:opacity-100',
            'group-focus-within/name:scale-100 group-focus-within/name:opacity-100',
            touchOpen ? 'scale-100 opacity-100' : '',
          ].join(' ')}
        >
          <span
            aria-hidden="true"
            className="absolute -top-1 left-3 h-2 w-2 rotate-45 border-l border-t border-gray-200 bg-white"
          />
          {product.name}
        </div>
      </div>
    );
  };

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
      className={`group flex h-full w-full cursor-pointer flex-col rounded-3xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,${P}_45%,white)] hover:shadow-xl ${focusRing} ${className || ''}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3.6] overflow-hidden rounded-2xl bg-gray-50">
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${outOfStock ? 'opacity-50' : ''}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-300">পণ্যের ছবি</div>
        )}

        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              onToggleWishlist(activeVariant.id);
            }}
            onKeyDown={stop}
            aria-label={wished ? 'উইশলিস্ট থেকে সরান' : 'উইশলিস্টে যোগ করুন'}
            aria-pressed={wished}
            className="absolute left-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-all duration-150 hover:scale-110 active:scale-90"
          >
            {wished ? (
              <FaHeart className={`text-[15px] text-[${P}]`} />
            ) : (
              <FaRegHeart className="text-[15px] text-gray-600" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mt-3 flex flex-1 flex-col gap-2.5 px-0.5">
        <NameWithTooltip />

        {showVariants &&
          (mergedChips ? (
            <div className="flex flex-wrap gap-2">
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
                    className={chipClass(isSelected, available)}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1.5">
              {visibleKeys.map((key) => (
                <div key={key} className="flex min-w-0 items-start gap-2">
                  <span className="min-w-[2.5rem] shrink-0 pt-2 text-[11px] text-gray-500">{key}</span>
                  <div className="flex min-w-0 flex-wrap gap-2">
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
                          className={chipClass(isSelected, available)}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}

        {/* Price row */}
        <div className="mt-auto flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className={`text-[22px] font-extrabold leading-none text-[${P}]`}>৳{price}</span>

          {hasCompare && (
            <span className="text-[14px] font-medium text-gray-400 line-through decoration-gray-400/70">
              ৳{activeVariant.compareAtPrice}
            </span>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            {discount > 0 && !outOfStock && (
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold leading-none text-[${P}] ${tint}`}>
                -{discount}%
              </span>
            )}
            {statusPill}
          </div>
        </div>

        {/* Actions */}
        {isPreOrder ? (
          <button
            type="button"
            disabled={buttonDisabled}
            onClick={handleAddToCart}
            onKeyDown={stop}
            className={`${btnPrimary} w-full`}
          >
            {adding ? <Spinner /> : <FaBolt className="text-[13px] transition-transform duration-200 group-hover/btn:scale-125" />}
            প্রি-অর্ডার করুন
          </button>
        ) : (
          <div className="grid grid-cols-[38%_62%] gap-2">
            <button
              type="button"
              disabled={buttonDisabled}
              onClick={handleAddToCart}
              onKeyDown={stop}
              aria-label="কার্টে যোগ করুন"
              className={btnOutline}
            >
              {adding ? (
                <Spinner dark />
              ) : (
                <MdAddShoppingCart className="text-[19px] transition-transform duration-200 group-hover/btn:-rotate-12 group-hover/btn:scale-110" />
              )}
              কার্ট
            </button>
            <button
              type="button"
              disabled={outOfStock}
              onClick={(e) => {
                stop(e);
                if (onBuyNow) onBuyNow(activeVariant.id, 1, attrsForAction);
              }}
              onKeyDown={stop}
              className={btnPrimary}
            >
              <FaBolt className="text-[13px] transition-transform duration-200 group-hover/btn:scale-125 group-hover/btn:rotate-12" />
              অর্ডার করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ProductCard);