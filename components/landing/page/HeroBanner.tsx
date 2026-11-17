"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { PLACEHOLDER_BANNER_TEXT, PLACEHOLDER_FEATURED, toBn } from "./Placeholders";

export interface BannerSlide {
  image: string;
  link?: string;
  alt?: string;
  categoryId?: string;
}

interface HeroBannerProps {
  banners: BannerSlide[];
  featured: any[];
  onOpenDetails: (productId: string, variantId: string) => void;
  onBannerClick?: (banner: BannerSlide) => void;
  primary: string;
  placeholder?: boolean;
}

interface FeaturedCard {
  key: string;
  name: string;
  image: string | null;
  price: number;
  compare: number;
  open: (() => void) | null;
}

const TAGS = ["সবচেয়ে বেশি বিক্রি", "সেরা রিভিউ"];
const PLACEHOLDER_DOTS = 5;
const PLACEHOLDER_ACTIVE_DOT = 2;

const arrowBtn =
  "absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#17181c] shadow-[0_4px_14px_rgba(0,0,0,.12)] backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_6px_20px_rgba(0,0,0,.18)] active:scale-95";

export default function HeroBanner({
  banners,
  featured,
  onOpenDetails,
  onBannerClick,
  primary,
  placeholder = false,
}: HeroBannerProps) {
  const [idx, setIdx] = useState(0);
  const slides = banners || [];
  const count = slides.length;
  const hasBanners = count > 0;
  const showBanner = hasBanners || placeholder;
  const total = hasBanners ? count : PLACEHOLDER_DOTS;
  const cur = hasBanners ? (idx < count ? idx : 0) : PLACEHOLDER_ACTIVE_DOT;

  useEffect(() => {
    if (count < 2) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % count), 5000);
    return () => clearTimeout(t);
  }, [count, idx]);

  const realCards: FeaturedCard[] = (featured || [])
    .filter((p) => Array.isArray(p?.variants) && p.variants.length > 0)
    .slice(0, 2)
    .map((p) => {
      const v = p.variants.find((x: any) => (x.stock ?? 0) > 0) || p.variants[0];
      return {
        key: String(p.id),
        name: p.name,
        image: v.image || (Array.isArray(p.images) && p.images[0]) || null,
        price: Number(v.preOrderPrice ?? v.price ?? 0) || 0,
        compare: Number(v.compareAtPrice ?? 0) || 0,
        open: () => onOpenDetails(p.id, v.id),
      };
    });

  const cards: FeaturedCard[] = realCards.length
    ? [
        ...realCards,
        ...PLACEHOLDER_FEATURED.slice(realCards.length).map((c) => ({
          key: c.id,
          name: c.name,
          image: null,
          price: c.price,
          compare: c.compare,
          open: null,
        })),
      ]
    : placeholder
      ? PLACEHOLDER_FEATURED.map((c) => ({
          key: c.id,
          name: c.name,
          image: null,
          price: c.price,
          compare: c.compare,
          open: null,
        }))
      : [];

  if (!showBanner && cards.length === 0) return null;

  const go = (d: number) => hasBanners && setIdx((cur + d + count) % count);

  return (
    <div className={`hero-banner-layout mt-5 ${showBanner && cards.length > 0 ? "hero-banner-layout-with-featured" : ""}`}>
      {showBanner && (
        <div
          className={`hero-banner-carousel group relative overflow-hidden rounded-[22px] shadow-[0_10px_40px_-12px_rgba(0,0,0,0.18)] ${
            hasBanners ? "bg-[#eceef2]" : "border border-dashed border-[#c9ccd4] bg-[#f6f7f9]"
          }`}
        >
          {hasBanners ? (
            slides.map((b, i) => {
              const active = i === cur;
              const img = (
                <img
                  src={b.image}
                  alt={b.alt || ""}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="h-full w-full object-cover transition-transform duration-[6000ms] ease-out group-hover:scale-[1.03]"
                />
              );
              return (
                <div
                  key={i}
                  aria-hidden={!active}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    active ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  {onBannerClick ? (
                    <button
                      type="button"
                      onClick={() => onBannerClick(b)}
                      tabIndex={active ? 0 : -1}
                      aria-label={b.alt || "ব্যানার দেখুন"}
                      className="absolute inset-0 h-full w-full"
                    >
                      {img}
                    </button>
                  ) : b.link ? (
                    <a href={b.link} tabIndex={active ? 0 : -1} className="absolute inset-0">
                      {img}
                    </a>
                  ) : (
                    img
                  )}
                </div>
              );
            })
          ) : (
            <div className="absolute inset-0 grid place-items-center px-16 text-center text-[15px] text-[#6b6f78]">
              {PLACEHOLDER_BANNER_TEXT}
            </div>
          )}

          {/* Soft gradient veil at bottom for contrast */}
          {hasBanners && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent" />
          )}

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={!hasBanners}
                aria-label="আগের ব্যানার"
                className={`${arrowBtn} left-3 opacity-0 group-hover:opacity-100 sm:left-4`}
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                disabled={!hasBanners}
                aria-label="পরের ব্যানার"
                className={`${arrowBtn} right-3 opacity-0 group-hover:opacity-100 sm:right-4`}
              >
                <FiChevronRight size={20} />
              </button>
              <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
                {Array.from({ length: total }, (_, i) => {
                  const on = i === cur;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => hasBanners && setIdx(i)}
                      disabled={!hasBanners}
                      aria-label={`স্লাইড ${i + 1}`}
                      aria-current={on ? "true" : undefined}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={
                        on
                          ? { width: 28, background: primary }
                          : { width: 6, background: "rgba(255,255,255,0.75)" }
                      }
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {cards.length > 0 && (
        <div className="hero-featured-grid">
          {cards.map((c, i) => (
            <article
              key={c.key}
              onClick={c.open ?? undefined}
              onKeyDown={(event) => {
                if (c.open && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  c.open();
                }
              }}
              role={c.open ? "button" : undefined}
              tabIndex={c.open ? 0 : undefined}
              className={`hero-featured-card group/card flex flex-col overflow-hidden rounded-[22px] border border-[#eceef2] bg-white shadow-[0_4px_16px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.18)] ${
                c.open ? "cursor-pointer" : ""
              }`}
            >
              <div className="relative min-h-[160px] flex-1 overflow-hidden bg-gradient-to-br from-[#f5f6f8] to-[#e8eaef]">
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                  />
                ) : (
                  <span className="absolute inset-0 grid place-items-center text-[13px] text-[#9aa0aa]">
                    পণ্যের ছবি
                  </span>
                )}

                {/* Badge */}
                <span
                  className="absolute left-3 top-3 z-[1] rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white shadow-lg"
                  style={{ background: primary, boxShadow: `0 6px 16px -6px ${primary}99` }}
                >
                  সেরা {toBn(i + 1)}
                </span>
              </div>

              <div className="flex flex-col gap-2 p-4">
                <h3 className="line-clamp-2 min-h-[2.6em] text-[15px] font-bold leading-[1.35] text-[#17181c]">
                  {c.name}
                </h3>

                <div className="flex items-baseline gap-2">
                  <span className="text-[17px] font-bold tracking-tight text-[#17181c]">
                    ৳{toBn(c.price)}
                  </span>
                  {c.compare > c.price && (
                    <s className="text-[12px] text-[#9aa0aa]">৳{toBn(c.compare)}</s>
                  )}
                </div>

                <button
                  type="button"
                  className="mt-1 h-9 rounded-xl text-[12.5px] font-semibold text-white transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: primary,
                    boxShadow: `0 6px 16px -8px ${primary}99`,
                  }}
                >
                  অর্ডার করুন
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}