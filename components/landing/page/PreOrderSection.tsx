"use client";

import { useMemo, useState } from "react";
import type { Product, Variant } from "@/types";
import { normalizeAttributes } from "@/lib/variants";
import ProductCard from "@/components/ProductCard";

interface PreOrderSectionProps {
  products: Product[];
  wishlistIds: Set<string>;
  addToCart: (variantId: string, qty?: number, attrs?: Record<string, string>) => void;
  onOpenDetails: (productId: string, variantId: string) => void;
  toggleWishlist: (id: string) => void;
  primary: string;
}

const isPreVariant = (v: Variant) => v.isPreOrder || (v as any).preOrderPrice != null;

function SectionHead() {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <span className="absolute -inset-1 animate-ping rounded-full bg-amber-400/30" />
          <span className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#17181c]">
            প্রি-অর্ডার পণ্য
          </h2>
          <p className="mt-0.5 text-[13px] text-[#6b6f78]">
            স্টক শেষ, এখনই বুক করুন
          </p>
        </div>
      </div>
      <span className="hidden rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 sm:inline-block">
        সীমিত স্টক
      </span>
    </div>
  );
}

function WidePreOrderCard({
  product: p,
  addToCart,
  primary,
}: {
  product: Product;
  addToCart: PreOrderSectionProps["addToCart"];
  primary: string;
}) {
  const variants = (p.variants || []) as Variant[];
  const preVariants = variants.filter(isPreVariant);
  const list = preVariants.length > 0 ? preVariants : variants;
  const [selId, setSelId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const active = list.find((v) => v.id === selId) || list[0];

  const labelOf = (v: Variant) =>
    Object.values(normalizeAttributes((v.attributes as Record<string, unknown>) || {}, p.name))
      .filter(Boolean)
      .join(" / ");
  const attrs = normalizeAttributes((active?.attributes as Record<string, unknown>) || {}, p.name);
  const price = Number((active as any)?.preOrderPrice ?? (active?.price || 0));
  const hasCompare = active?.compareAtPrice != null && active.compareAtPrice > active.price;
  const image = active?.image || (Array.isArray(p.images) && p.images[0]) || null;
  const chips = list.map((v) => ({ id: v.id, label: labelOf(v) })).filter((c) => c.label);

  const handleAdd = () => {
    if (!active) return;
    addToCart(active.id, 1, attrs);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className="group relative grid overflow-hidden rounded-[24px] border border-[#e7e8ec] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_20px_50px_-12px_rgba(217,119,6,0.25)] md:grid-cols-[340px_1fr]">
      {/* Gradient accent border on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[24px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${primary}08, transparent 40%, #f59e0b08)`,
        }}
      />

      {/* Image */}
      <div className="relative min-h-[280px] overflow-hidden bg-gradient-to-br from-[#f3f4f7] to-[#e8eaef]">
        {image ? (
          <img
            src={image}
            alt={p.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full min-h-[280px] place-items-center text-xs text-[#6b6f78]">
            পণ্যের ছবি
          </div>
        )}

        {/* Shine sweep on hover */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        {/* Badge */}
        <div className="absolute left-3 top-3 z-[1] flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-orange-500/30">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          প্রি-অর্ডার
        </div>

        {/* Corner discount tag */}
        {hasCompare && (
          <div className="absolute bottom-3 left-3 z-[1] rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-bold text-red-600 shadow-md backdrop-blur">
            ৳{(active.compareAtPrice! - price).toFixed(0)} সাশ্রয়
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative flex flex-col justify-center gap-3.5 p-5 md:px-8 md:py-7">
        <span className="w-fit rounded-full bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200/60">
          ⏳ স্টক শেষ, এখনই বুক করুন
        </span>

        <h3 className="break-words text-[22px] font-bold leading-tight text-[#17181c] transition-colors duration-200 group-hover:text-[#0f1013]">
          {p.name}
        </h3>

        {/* Variant chips */}
        {chips.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((c) => {
              const on = c.id === active?.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelId(c.id)}
                  className={`rounded-lg border px-2.5 py-1 text-xs transition-all duration-200 ${
                    on
                      ? "scale-105 shadow-sm"
                      : "hover:-translate-y-0.5 hover:shadow-sm"
                  }`}
                  style={
                    on
                      ? { borderColor: primary, color: primary, fontWeight: 600, background: `${primary}0d` }
                      : { borderColor: "#e7e8ec", color: "#4b5058" }
                  }
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <b className="text-[28px] leading-none tracking-tight text-[#17181c]">
            ৳{price.toFixed(0)}
          </b>
          {hasCompare && (
            <s className="text-[13px] text-[#9aa0aa]">৳{active?.compareAtPrice ?? 0}</s>
          )}
        </div>

        <p className="flex items-center gap-1.5 text-[13px] text-[#6b6f78]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-amber-500">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          পণ্য এলে জানানো হবে, ডেলিভারি সময় দোকান ঠিক করবে
        </p>

        {/* CTA */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleAdd();
          }}
          disabled={!active}
          className="group/btn relative mt-1 h-[46px] w-full overflow-hidden rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl active:scale-[0.98] disabled:opacity-50 md:max-w-[380px]"
          style={{
            background: added
              ? "linear-gradient(135deg, #16a34a, #15803d)"
              : `linear-gradient(135deg, ${primary}, ${primary}dd)`,
            boxShadow: added
              ? "0 10px 24px -8px rgba(22,163,74,0.5)"
              : `0 10px 24px -8px ${primary}80`,
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {added ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                কার্টে যোগ হয়েছে
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                প্রি-অর্ডার করুন
              </>
            )}
          </span>
          {/* Button shine */}
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
        </button>
      </div>
    </article>
  );
}

export default function PreOrderSection({
  products,
  wishlistIds,
  addToCart,
  onOpenDetails,
  toggleWishlist,
  primary,
}: PreOrderSectionProps) {
  const preOrderProducts = useMemo(
    () =>
      (products || [])
        .filter((p) => Array.isArray(p.variants) && p.variants.length > 0)
        .filter((p) => (p.variants as Variant[]).some(isPreVariant)),
    [products],
  );

  if (preOrderProducts.length === 0) return null;

  if (preOrderProducts.length === 1) {
    return (
      <section className="mt-9">
        <SectionHead />
        <WidePreOrderCard product={preOrderProducts[0]} addToCart={addToCart} primary={primary} />
      </section>
    );
  }

  return (
    <section className="mt-9">
      <SectionHead />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {preOrderProducts.map((p, i) => (
          <div
            key={p.id}
            className="h-full animate-[fadeUp_0.5s_ease-out_both]"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <ProductCard
              product={p as any}
              onAddToCart={(variantId, qty, attrs) => addToCart(variantId, qty ?? 1, attrs)}
              onBuyNow={(variantId) => onOpenDetails(p.id, variantId)}
              onOpenDetails={onOpenDetails}
              onToggleWishlist={toggleWishlist}
              isWishlisted={(variantId) => wishlistIds.has(variantId)}
              className="h-full transition-transform duration-300 hover:-translate-y-1"
            />
          </div>
        ))}
      </div>
    </section>
  );
}