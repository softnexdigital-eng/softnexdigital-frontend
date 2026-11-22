'use client';

import {
  memo,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
  type MouseEvent,
  type KeyboardEvent,
  type CSSProperties,
} from 'react';
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

/* Theme: Red Grocery Store. Card reads your site's --primary (default #E81746 red). */
const themeVars = {
  '--p': 'var(--primary, #E81746)',
} as CSSProperties;

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p)] focus-visible:ring-offset-2';

const btnBase =
  'inline-flex h-9 items-center justify-center gap-1.5 text-[12.5px] font-bold sm:h-10 sm:gap-2 sm:text-[14px] transition-all duration-200 ease-out active:scale-[0.96] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none motion-reduce:active:scale-100';

const btnSolid = `${btnBase} ${focusRing} rounded-xl bg-[var(--p)] text-white hover:brightness-110`;

const btnSoft = `${btnBase} ${focusRing} rounded-xl bg-white/90 text-[var(--p)] hover:bg-white`;

/* Chips are designed for the dark overlay at the bottom of the image */
const chipClass = (isSelected: boolean, available: boolean) =>
  [
    'min-h-[22px] whitespace-nowrap rounded-lg px-2.5 text-[11.5px] font-semibold sm:min-h-[28px] sm:px-3 sm:text-[12.5px] transition-all duration-150 active:scale-95',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-black/40',
    isSelected
      ? 'bg-white text-[var(--p)] shadow-sm'
      : available
        ? 'bg-white/15 text-white backdrop-blur-sm hover:bg-white/30'
        : 'cursor-not-allowed bg-white/5 text-white/35 line-through',
  ].join(' ');

const Spinner = () => (
  <span
    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    aria-hidden="true"
  />
);

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

  /* ---------- Add-to-cart loading logic ---------- */
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
  const hasDiscountTab = discount > 0 && !outOfStock;

  /* Status chip: top-left (below the discount tab if there is one) */
  const statusChip = outOfStock ? (
    <span className="rounded-full bg-[#191919]/80 px-2 py-1 text-[10.5px] font-bold leading-none text-white backdrop-blur-md sm:px-3 sm:py-1.5 sm:text-[11.5px]">
      স্টক শেষ
    </span>
  ) : isPreOrder ? (
    <span className="rounded-full bg-amber-400 px-2 py-1 text-[10.5px] font-bold leading-none text-amber-950 sm:px-3 sm:py-1.5 sm:text-[11.5px]">
      প্রি-অর্ডার
    </span>
  ) : lowStock ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-1 text-[10.5px] font-bold leading-none text-[#191919] backdrop-blur-md sm:px-3 sm:py-1.5 sm:text-[11.5px]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--p)]" aria-hidden="true" />
      মাত্র {stock}টি বাকি
    </span>
  ) : null;

  const mergedChipButtons = (list: NonNullable<typeof mergedChips>) =>
    list.map(({ key, val, variant }) => {
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
    });

  const showVariants = visibleKeys.length > 0 && variants.length > 1;

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
      style={themeVars}
      className={`group relative isolate aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-[18px] bg-[#F3EDE4] shadow-[0_10px_28px_-18px_rgba(25,25,25,0.35)] ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-[0_18px_40px_-16px_color-mix(in_srgb,var(--p)_45%,transparent)] motion-reduce:transition-none sm:aspect-[4/5] sm:rounded-[26px] ${focusRing} ${className || ''}`}
    >
      {/* ===== Image layer: full image visible (contain) + blurred copy fills any side space ===== */}
      <div className="absolute inset-0 z-0">
        {displayImage ? (
          <>
            <img
              src={displayImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full scale-125 object-cover opacity-90 blur-2xl"
            />
            <img
              src={displayImage}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className={`relative h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
                outOfStock ? 'opacity-60 grayscale' : ''
              }`}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[#C9C2B8]">পণ্যের ছবি</div>
        )}
      </div>

      {/* Discount: corner tab, flush with the card edge */}
      {hasDiscountTab && (
        <span className="absolute left-0 top-0 z-[2] rounded-br-[14px] bg-[var(--p)] px-2 pb-1.5 pt-1 text-[11px] font-extrabold leading-none text-white sm:rounded-br-[18px] sm:px-3 sm:pb-2 sm:pt-1.5 sm:text-[13px]">
          -{discount}%
        </span>
      )}

      {statusChip && (
        <div className={`absolute left-1.5 z-[2] sm:left-2.5 ${hasDiscountTab ? 'top-8 sm:top-10' : 'top-1.5 sm:top-2.5'}`}>
          {statusChip}
        </div>
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
          className={`absolute right-1.5 top-1.5 z-[2] flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-md transition-all duration-150 hover:scale-110 hover:bg-white active:scale-90 motion-reduce:transition-none sm:right-2.5 sm:top-2.5 sm:h-9 sm:w-9 ${focusRing}`}
        >
          {wished ? (
            <FaHeart className="text-[15px] text-[var(--p)]" />
          ) : (
            <FaRegHeart className="text-[15px] text-[#5B534A]" />
          )}
        </button>
      )}
      {/* ===== Info overlay: name, attributes, price, actions ===== */}
      <div className="absolute inset-x-0 bottom-0 z-[2] flex flex-col gap-1.5 bg-gradient-to-t from-black/90 via-black/65 to-transparent px-2 pb-2 pt-12 sm:gap-2 sm:px-3 sm:pb-3 sm:pt-16">
        <h3
          title={product.name}
          className="line-clamp-2 break-words text-[13px] font-bold leading-snug tracking-tight text-white drop-shadow sm:line-clamp-1 sm:text-[15px]"
        >
          {product.name}
        </h3>

        {/* Attributes (two-attribute products) */}
        {showVariants && !mergedChips && (
          <div className="space-y-1">
            {visibleKeys.map((key) => (
              <div key={key} className="flex min-w-0 items-center gap-2">
                <span className="hidden min-w-[2rem] shrink-0 text-[11px] font-medium text-white/60 sm:inline">{key}</span>
                <div className="flex min-w-0 flex-wrap gap-1">
                  {(options[key] || []).map((val) => {
                    const isSelected = selected[key] === val;
                    const available = isOptionAvailable(variants, selected, key, val, product.name);
                    return (
                      <button
                        key={val}
                        type="button"
                        disabled={!available}
                        aria-pressed={isSelected}
                        aria-label={`${key}: ${val}`}
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
        )}

        {/* Price (+ up to 2 single-attribute chips on the same row) */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[19px] font-black leading-none tracking-tight text-white sm:text-[24px]">
              <span className="mr-0.5 text-[13px] font-extrabold text-white/80 sm:text-[16px]">৳</span>
              {price}
            </span>
            {hasCompare && (
              <span className="text-[11.5px] font-medium text-white/55 line-through sm:text-[13px]">
                ৳{activeVariant.compareAtPrice}
              </span>
            )}
          </div>

          {showVariants && mergedChips && mergedChips.length <= 2 && (
            <div className="ml-auto flex flex-wrap justify-end gap-1">{mergedChipButtons(mergedChips)}</div>
          )}
        </div>

        {/* 3+ single-attribute options: scrollable segmented selector */}
        {showVariants && mergedChips && mergedChips.length > 2 && (
          <div
            role="group"
            className="flex gap-1 overflow-x-auto rounded-xl bg-white/10 p-0.5 backdrop-blur-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {mergedChips.map(({ key, val, variant }) => {
              const isSelected = attrsForAction[key] === val;
              const available = (variant.stock ?? 0) > 0 || isSelected;
              return (
                <button
                  key={`seg-${key}-${val}`}
                  type="button"
                  disabled={!available}
                  aria-pressed={isSelected}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelected(normalizeAttributes(variant.attributes as unknown as Record<string, unknown>, product.name));
                  }}
                  onKeyDown={stop}
                  className={[
                    'min-h-[26px] flex-1 shrink-0 whitespace-nowrap rounded-lg px-2.5 text-center text-[11.5px] font-semibold transition-all duration-150 active:scale-95 motion-reduce:transition-none sm:min-h-[30px] sm:px-3 sm:text-[12.5px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                    isSelected
                      ? 'bg-white text-[var(--p)] shadow-sm'
                      : available
                        ? 'text-white hover:bg-white/20'
                        : 'cursor-not-allowed text-white/35 line-through',
                  ].join(' ')}
                >
                  {val}
                </button>
              );
            })}
          </div>
        )}

        {/* Actions */}
        {isPreOrder ? (
          <button type="button" disabled={buttonDisabled} onClick={handleAddToCart} onKeyDown={stop} className={`${btnSolid} w-full`}>
            {adding ? <Spinner /> : <FaBolt className="text-[13px]" />}
            প্রি-অর্ডার করুন
          </button>
        ) : (
          <div className="flex gap-1.5 sm:gap-2">
            <button
              type="button"
              disabled={buttonDisabled}
              onClick={handleAddToCart}
              onKeyDown={stop}
              aria-label="কার্টে যোগ করুন"
              className={`${btnSoft} w-10 shrink-0 sm:w-12`}
            >
              {adding ? <Spinner /> : <MdAddShoppingCart className="text-[18px] sm:text-[21px]" />}
            </button>
            <button
              type="button"
              disabled={outOfStock}
              onClick={(e) => {
                stop(e);
                if (onBuyNow) onBuyNow(activeVariant.id, 1, attrsForAction);
              }}
              onKeyDown={stop}
              className={`${btnSolid} min-w-0 flex-1`}
            >
              <FaBolt className="hidden text-[13px] sm:block" />
              অর্ডার করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ProductCard);


