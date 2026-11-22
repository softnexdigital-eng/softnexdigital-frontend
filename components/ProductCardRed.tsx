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

/* Theme: card reads your site's --primary. Exposed as --p so every class
   below stays a *static* Tailwind string. */
const themeVars = {
  '--p': 'var(--primary, #E81746)',
} as CSSProperties;

/* Only keyframes live in a <style> tag (inline CSS cannot define keyframes).
   Everything else is inline Tailwind. Identical names across cards are harmless. */
const GlassKeyframes = () => (
  <style>{`@keyframes glassDriftA{to{transform:translate(90%,120%) scale(1.15)}}@keyframes glassDriftB{to{transform:translate(-90%,-120%) scale(1.1)}}@keyframes glassSheen{0%,60%{transform:translateX(-160%) skewX(-18deg)}100%{transform:translateX(420%) skewX(-18deg)}}`}</style>
);

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p)] focus-visible:ring-offset-2';

const btnBase =
  'inline-flex h-9 items-center justify-center gap-1.5 text-[12.5px] font-bold sm:h-11 sm:gap-2 sm:text-[14px] transition-all duration-200 ease-out active:scale-[0.96] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none motion-reduce:active:scale-100';

const btnSolid = `${btnBase} ${focusRing} rounded-xl bg-[var(--p)] text-white sm:rounded-2xl hover:bg-[#191919]`;

const btnSoft = `${btnBase} ${focusRing} rounded-xl sm:rounded-2xl bg-[#FFF1F0] text-[var(--p)] hover:bg-[#191919] hover:text-white`;

const chipClass = (isSelected: boolean, available: boolean) =>
  [
    'min-h-[20px] whitespace-nowrap rounded-lg px-2.5 text-[11.5px] font-semibold sm:min-h-[30px] sm:px-3 sm:text-[12.5px] transition-all duration-150 active:scale-95',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p)] focus-visible:ring-offset-1',
    isSelected
      ? 'bg-[#FFF1F0] text-[var(--p)] ring-1 ring-inset ring-[var(--p)]'
      : available
        ? 'bg-[#F5F0E8] text-[#5B534A] hover:bg-[#FFF1F0] hover:text-[var(--p)]'
        : 'cursor-not-allowed bg-[#F5F0E8]/60 text-[#C9C2B8] line-through decoration-[#C9C2B8]',
  ].join(' ');

const Spinner = () => (
  <span
    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    aria-hidden="true"
  />
);

/* ---------- Product name + full-name tooltip (hover / focus / long-press) ---------- */
function NameWithTooltip({ name }: { name: string }) {
  const [touchOpen, setTouchOpen] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const clearTimers = () => {
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    longPressTimer.current = null;
    closeTimer.current = null;
  };

  useEffect(() => clearTimers, []);

  const onTouchStart = () => {
    clearTimers();
    longPressTimer.current = window.setTimeout(() => setTouchOpen(true), 350);
  };
  const onTouchEnd = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (touchOpen) closeTimer.current = window.setTimeout(() => setTouchOpen(false), 2200);
  };

  return (
    <div
      className="group/name relative"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={() => {
        clearTimers();
        setTouchOpen(false);
      }}
    >
      <h3
        tabIndex={0}
        aria-label={name}
        className={`line-clamp-2 break-words rounded-md text-[13.5px] font-bold sm:line-clamp-1 sm:text-[15.5px] leading-snug tracking-tight text-[#191919] ${focusRing}`}
      >
        {name}
      </h3>

      <div
        role="tooltip"
        className={[
          'pointer-events-none absolute left-0 top-full z-30 mt-2 w-max max-w-[min(92vw,22rem)]',
          'origin-top-left scale-95 rounded-xl bg-[#191919] px-3 py-2',
          'whitespace-normal break-words text-[12.5px] font-medium leading-relaxed text-white shadow-xl',
          'opacity-0 transition-all duration-200 motion-reduce:transition-none',
          'group-hover/name:scale-100 group-hover/name:opacity-100',
          'group-focus-within/name:scale-100 group-focus-within/name:opacity-100',
          touchOpen ? 'scale-100 opacity-100' : '',
        ].join(' ')}
      >
        <span aria-hidden="true" className="absolute -top-1 left-4 h-2 w-2 rotate-45 bg-[#191919]" />
        {name}
      </div>
    </div>
  );
}

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

  /* ---------- Add-to-cart loading logic (unchanged) ---------- */
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

  /* Status chip sits on the image, bottom-left */
  const statusChip = outOfStock ? (
    <span className="rounded-full bg-[#191919]/80 px-2 py-1 text-[10.5px] sm:px-3 sm:py-1.5 sm:text-[11.5px] font-bold leading-none text-white backdrop-blur-md">
      স্টক শেষ
    </span>
  ) : isPreOrder ? (
    <span className="rounded-full bg-amber-400 px-2 py-1 text-[10.5px] sm:px-3 sm:py-1.5 sm:text-[11.5px] font-bold leading-none text-amber-950">
      প্রি-অর্ডার
    </span>
  ) : lowStock ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-1 text-[10.5px] sm:px-3 sm:py-1.5 sm:text-[11.5px] font-bold leading-none text-[#191919] backdrop-blur-md">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--p)]" aria-hidden="true" />
      মাত্র {stock}টি বাকি
    </span>
  ) : null;

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
      className={`group relative flex h-full w-full cursor-pointer flex-col rounded-[20px] bg-[linear-gradient(145deg,#ffffff_0%,#fffdfb_55%,#fff6f1_100%)] p-1.5 ring-1 ring-[#EEEAE4] shadow-[inset_0_1px_0_#fff,0_10px_28px_-20px_rgba(25,25,25,0.18)] transition-shadow duration-300 hover:shadow-[inset_0_1px_0_#fff,0_18px_40px_-18px_color-mix(in_srgb,var(--p)_40%,transparent)] motion-reduce:transition-none sm:rounded-[28px] sm:p-2 ${focusRing} ${className || ''}`}
    >
      <GlassKeyframes />

      {/* Floating soft light inside the card (behind content, clipped to the card) */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
        <span className="absolute -left-[15%] -top-[10%] h-[55%] w-[65%] rounded-full bg-[color-mix(in_srgb,var(--p)_26%,white)] opacity-[0.45] blur-[30px] animate-[glassDriftA_9s_ease-in-out_infinite_alternate] motion-reduce:animate-none" />
        <span className="absolute -bottom-[10%] -right-[15%] h-[50%] w-[60%] rounded-full bg-[#ffd9a8] opacity-50 blur-[30px] animate-[glassDriftB_11s_ease-in-out_infinite_alternate] motion-reduce:animate-none" />
      </span>

      {/* ===== Image ===== */}
      <div className="relative z-[1] aspect-square overflow-hidden rounded-[15px] bg-[#F3EDE4] sm:aspect-[4/4.2] sm:rounded-[22px]">
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
              outOfStock ? 'opacity-60 grayscale' : ''
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[#C9C2B8]">পণ্যের ছবি</div>
        )}

        {/* Oily gloss sweep across the image */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute -bottom-[30%] -top-[30%] left-0 w-[40%] bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.55),transparent)] animate-[glassSheen_6s_ease-in-out_infinite] motion-reduce:animate-none" />
        </span>

        {/* Discount: a corner tab, flush with the image edge */}
        {discount > 0 && !outOfStock && (
          <span className="absolute left-0 top-0 rounded-br-[14px] bg-[var(--p)] px-2 pb-1.5 pt-1 text-[11px] sm:rounded-br-[18px] sm:px-3 sm:pb-2 sm:pt-1.5 sm:text-[13px] font-extrabold leading-none text-white">
            -{discount}%
          </span>
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
            className={`absolute right-1.5 top-1.5 flex h-8 w-8 sm:right-2.5 sm:top-2.5 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md transition-all duration-150 hover:scale-110 hover:bg-[#FFF1F0] active:scale-90 motion-reduce:transition-none ${focusRing}`}
          >
            {wished ? (
              <FaHeart className="text-[15px] text-[var(--p)]" />
            ) : (
              <FaRegHeart className="text-[15px] text-[#5B534A]" />
            )}
          </button>
        )}

        {statusChip && <div className="absolute bottom-1.5 left-1.5 sm:bottom-2.5 sm:left-2.5">{statusChip}</div>}
      </div>

      {/* ===== Content ===== */}
      <div className="relative z-[1] flex flex-1 flex-col gap-2 px-1.5 pb-1.5 pt-2.5 sm:gap-3 sm:px-2.5 sm:pb-2.5 sm:pt-3.5">
        <NameWithTooltip name={product.name} />

        {/* Variants */}
        {showVariants && !mergedChips && (
          <div className="space-y-2">
            {visibleKeys.map((key) => (
              <div key={key} className="flex min-w-0 items-start gap-2.5">
                <span className="min-w-[2.25rem] shrink-0 pt-[7px] text-[11.5px] font-medium text-[#A39B90]">{key}</span>
                <div className="flex min-w-0 flex-wrap gap-1.5">
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
        )}

        {/* Price + single-attribute chips on one row */}
        <div className="mt-auto flex flex-col items-start gap-1.5 pt-0.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-2 sm:pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[20px] font-black sm:text-[26px] leading-none tracking-tight text-[#191919]">
              <span className="mr-0.5 text-[14px] font-extrabold sm:text-[17px] text-[var(--p)]">৳</span>
              {price}
            </span>
            {hasCompare && (
              <span className="text-[12px] font-medium text-[#A39B90] line-through sm:text-[13.5px] decoration-[#C9C2B8]">
                ৳{activeVariant.compareAtPrice}
              </span>
            )}
          </div>

          {showVariants && mergedChips && mergedChips.length <= 2 && (
            <div className="flex flex-wrap gap-1 sm:ml-auto sm:justify-end sm:gap-1.5">
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
          )}
        </div>

        {/* 3+ single-attribute options: full-width segmented selector */}
        {showVariants && mergedChips && mergedChips.length > 2 && (
          <div
            role="group"
            className="-mt-0.5 flex gap-1 overflow-x-auto rounded-xl bg-[#F3EDE4] p-0.5 sm:-mt-1 sm:gap-1.5 sm:p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                    'min-h-[28px] flex-1 shrink-0 whitespace-nowrap rounded-lg px-2.5 text-center text-[11.5px] sm:min-h-[32px] sm:px-3 sm:text-[12.5px] font-semibold transition-all duration-150 active:scale-95 motion-reduce:transition-none',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p)] focus-visible:ring-offset-1',
                    isSelected
                      ? 'bg-white text-[var(--p)] shadow-sm ring-1 ring-[var(--p)]'
                      : available
                        ? 'text-[#5B534A] hover:bg-white hover:text-[var(--p)]'
                        : 'cursor-not-allowed text-[#C9C2B8] line-through decoration-[#C9C2B8]',
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