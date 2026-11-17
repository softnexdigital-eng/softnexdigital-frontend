"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { normalizeAttributes } from "@/lib/variants";

interface ProductCardProps {
  product: any;
  onAddToCart: (variantId: string, qty?: number, attrs?: Record<string, string>) => void;
  onBuyNow: (variantId: string) => void;
  onOpenDetails: (productId: string, variantId: string) => void;
  onToggleWishlist: (variantId: string) => void;
  isWishlisted: (variantId: string) => boolean;
  cartLoading?: boolean;
  className?: string;
}

const isPre = (v: any) => !!v?.isPreOrder || v?.preOrderPrice != null;
const inStock = (v: any) => (v?.stock ?? 0) > 0;

export default function ProductCard({
  product,
  onAddToCart,
  onBuyNow,
  onOpenDetails,
  onToggleWishlist,
  isWishlisted,
  cartLoading,
  className = "",
}: ProductCardProps) {
  const variants: any[] = useMemo(() => (Array.isArray(product?.variants) ? product.variants : []), [product]);
  const [selId, setSelId] = useState<string | null>(null);

  const active = variants.find((v) => v.id === selId) || variants.find((v) => inStock(v) || isPre(v)) || variants[0];
  if (!active) return null;

  const pre = isPre(active);
  const out = !pre && !inStock(active);
  const price = Number(active.preOrderPrice ?? active.price ?? 0);
  const compare = Number(active.compareAtPrice ?? 0);
  const discount = !pre && compare > price && price > 0 ? Math.round((1 - price / compare) * 100) : 0;
  const image = active.image || (Array.isArray(product.images) && product.images[0]) || null;
  const wished = isWishlisted(active.id);

  const labelOf = (v: any) =>
    Object.values(normalizeAttributes((v.attributes || {}) as Record<string, unknown>, product.name))
      .filter(Boolean)
      .join(" / ");
  const attrsOf = (v: any) => normalizeAttributes((v.attributes || {}) as Record<string, unknown>, product.name);
  const chips = variants.map((v) => ({ id: v.id, label: labelOf(v) })).filter((c) => c.label);

  const badge = pre
    ? { text: "প্রি-অর্ডার", cls: "bg-[#b45309]" }
    : out
      ? { text: "স্টক শেষ", cls: "bg-[#4b5058]" }
      : discount > 0
        ? { text: `${discount}% ছাড়`, cls: "" }
        : null;

  const open = () => onOpenDetails(product.id, active.id);

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border border-[#e7e8ec] bg-white ${className}`}
    >
      <div className="relative aspect-square cursor-pointer bg-[#eceef2]" onClick={open}>
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-cover ${out ? "opacity-55" : ""}`}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-[#6b6f78]">পণ্যের ছবি</div>
        )}
        {badge && (
          <i
            className={`absolute left-2.5 top-2.5 z-[1] rounded-full px-2.5 py-1 text-[11px] font-semibold not-italic text-white ${badge.cls}`}
            style={badge.cls ? undefined : { background: "var(--primary,#e11d48)" }}
          >
            {badge.text}
          </i>
        )}
        <button
          type="button"
          aria-label="উইশলিস্ট"
          aria-pressed={wished}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(active.id);
          }}
          className="absolute right-2.5 top-2.5 z-[1] grid h-[34px] w-[34px] place-items-center rounded-full bg-white text-[#4b5058]"
        >
          {wished ? <FaHeart className="text-sm text-rose-500" /> : <FaRegHeart className="text-sm" />}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3.5 pb-3.5 pt-3">
        <h3
          onClick={open}
          className="line-clamp-2 min-h-[38px] cursor-pointer text-sm font-semibold leading-[1.35] text-[#17181c]"
        >
          {product.name}
        </h3>

        <div className="flex min-h-[26px] flex-wrap gap-1.5">
          {chips.length > 1 &&
            chips.slice(0, 4).map((c) => {
              const on = c.id === active.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelId(c.id)}
                  className="rounded-lg border px-[9px] py-[3px] text-xs"
                  style={
                    on
                      ? { borderColor: "var(--primary,#e11d48)", color: "var(--primary,#e11d48)", fontWeight: 600 }
                      : { borderColor: "#e7e8ec", color: "#4b5058" }
                  }
                >
                  {c.label}
                </button>
              );
            })}
          {chips.length > 4 && <span className="py-[3px] text-xs text-[#6b6f78]">+{chips.length - 4}</span>}
        </div>

        <div className="mt-auto flex items-baseline gap-2">
          <b className="text-lg text-[#17181c]">৳{price.toFixed(0)}</b>
          {compare > price && !pre && <s className="text-[13px] text-[#6b6f78]">৳{compare.toFixed(0)}</s>}
        </div>

        <div className="flex gap-2">
          {out ? (
            <button disabled className="h-[42px] flex-1 cursor-not-allowed rounded-xl bg-[#d5d7de] text-sm font-semibold text-[#4b5058]">
              স্টক শেষ
            </button>
          ) : pre ? (
            <button
              type="button"
              onClick={() => onAddToCart(active.id, 1, attrsOf(active))}
              disabled={cartLoading}
              className="h-[42px] flex-1 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--primary,#e11d48)" }}
            >
              প্রি-অর্ডার করুন
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onAddToCart(active.id, 1, attrsOf(active))}
                disabled={cartLoading}
                className="h-[42px] flex-[0_0_38%] rounded-xl border border-[#d5d7de] bg-white text-sm font-semibold text-[#17181c] disabled:opacity-60"
              >
                কার্ট
              </button>
              <button
                type="button"
                onClick={() => onBuyNow(active.id)}
                className="h-[42px] flex-1 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--primary,#e11d48)" }}
              >
                অর্ডার করুন
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
