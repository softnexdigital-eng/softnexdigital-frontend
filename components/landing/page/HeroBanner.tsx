"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type CSSProperties } from "react";
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
  "absolute top-1/2 z-[3] grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-white/55 text-[#191919] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_-8px_rgba(25,25,25,0.45)] backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 hover:scale-105 hover:bg-white active:scale-95 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E81746] disabled:cursor-default motion-reduce:transition-none";

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
    className={`hero-banner-carousel group/banner relative min-h-[210px] overflow-hidden rounded-[26px] ring-1 ring-[#EEEAE4] shadow-[0_24px_50px_-28px_rgba(25,25,25,0.45)] sm:min-h-[320px] lg:min-h-[420px] ${
      hasBanners ? "bg-[#F3EDE4]" : "border border-dashed border-[#E4DDD2] bg-[#F3EDE4]"
    }`}
  >
    {/* Keyframes only (inline CSS can't define them). Everything else is inline Tailwind. */}
    <style>{`@keyframes heroBannerSheen{0%,55%{transform:translateX(-160%) skewX(-18deg)}100%{transform:translateX(480%) skewX(-18deg)}}@keyframes heroBannerProgress{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>

    {hasBanners ? (
      slides.map((b, i) => {
        const active = i === cur;
        const img = (
          <img
            src={b.image}
            alt={b.alt || ""}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            className={`h-full w-full object-cover transition-transform duration-[6000ms] ease-out motion-reduce:transition-none ${
              active ? "scale-100" : "scale-[1.06]"
            }`}
          />
        );
        return (
          <div
            key={i}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-[900ms] ease-out motion-reduce:transition-none ${
              active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {onBannerClick ? (
              <button
                type="button"
                onClick={() => onBannerClick(b)}
                tabIndex={active ? 0 : -1}
                aria-label={b.alt || "ব্যানার দেখুন"}
                className="absolute inset-0 h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#E81746]"
              >
                {img}
              </button>
            ) : b.link ? (
              <a
                href={b.link}
                tabIndex={active ? 0 : -1}
                className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#E81746]"
              >
                {img}
              </a>
            ) : (
              img
            )}
          </div>
        );
      })
    ) : (
      <div className="absolute inset-0 grid place-items-center px-16 text-center text-[15px] text-[#A39B90]">
        {PLACEHOLDER_BANNER_TEXT}
      </div>
    )}

    {/* Soft veil so the glass controls always read well */}
    {hasBanners && (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-28 bg-[linear-gradient(to_top,rgba(25,25,25,0.35),transparent)]"
      />
    )}

    {/* Oily gloss sweep */}
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      <span className="absolute -bottom-[30%] -top-[30%] left-0 w-[26%] bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.32),transparent)] animate-[heroBannerSheen_8s_ease-in-out_infinite] motion-reduce:animate-none" />
    </span>

    {/* Glass rim */}
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45),inset_0_1px_0_rgba(255,255,255,0.8)]"
    />

    {/* Slide counter */}
    {hasBanners && total > 1 && (
      <span className="pointer-events-none absolute right-4 top-4 z-[3] rounded-full border border-white/60 bg-white/55 px-3 py-1 text-[11.5px] font-bold leading-none text-[#191919] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
        {toBn(cur + 1)} / {toBn(total)}
      </span>
    )}

    {total > 1 && (
      <>
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={!hasBanners}
          aria-label="আগের ব্যানার"
          className={`${arrowBtn} left-3 opacity-0 group-hover/banner:opacity-100 sm:left-4`}
        >
          <FiChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={!hasBanners}
          aria-label="পরের ব্যানার"
          className={`${arrowBtn} right-3 opacity-0 group-hover/banner:opacity-100 sm:right-4`}
        >
          <FiChevronRight size={20} />
        </button>

        {/* Glass dots; the active one fills up like a timer */}
        <div className="absolute bottom-4 left-1/2 z-[3] flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/60 bg-white/50 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_-10px_rgba(25,25,25,0.45)] backdrop-blur-xl backdrop-saturate-150">
          {Array.from({ length: total }, (_, i) => {
            const on = i === cur;
            return (
              <button
                key={i}
                type="button"
                onClick={() => hasBanners && setIdx(i)}
                disabled={!hasBanners}
                aria-label={`স্লাইড ${toBn(i + 1)}`}
                aria-current={on ? "true" : undefined}
                className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-500 motion-reduce:transition-none ${
                  on ? "w-8 bg-[#191919]/15" : "w-1.5 bg-[#191919]/35 hover:bg-[#191919]/60"
                }`}
              >
                {on && (
                  <span
                    key={cur}
                    className={`absolute inset-0 origin-left rounded-full ${
                      hasBanners
                        ? "animate-[heroBannerProgress_5s_linear_forwards] motion-reduce:animate-none"
                        : ""
                    }`}
                    style={{ background: primary }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </>
    )}
  </div>
)}

    {cards.length > 0 && (
  <>
    {/* Keyframes only (inline CSS can't define them). Everything else is inline Tailwind. */}
    <style>{`@keyframes heroFeatSheen{0%,55%{transform:translateX(-160%) skewX(-18deg)}100%{transform:translateX(420%) skewX(-18deg)}}@keyframes heroFeatNudge{0%,100%{transform:translateX(0)}50%{transform:translateX(4px)}}`}</style>

    <div className="grid h-full min-h-0 grid-cols-2 gap-3 sm:gap-4 lg:min-h-[380px] lg:grid-cols-1 lg:grid-rows-2">
      {cards.map((c, i) => (
        <article
          key={c.key}
          onClick={c.open ?? undefined}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (c.open && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              c.open();
            }
          }}
          onMouseMove={(event) => {
            const el = event.currentTarget;
            const r = el.getBoundingClientRect();
            el.style.setProperty("--mx", `${event.clientX - r.left}px`);
            el.style.setProperty("--my", `${event.clientY - r.top}px`);
          }}
          role={c.open ? "button" : undefined}
          tabIndex={c.open ? 0 : undefined}
          aria-label={c.open ? `${c.name}, বিস্তারিত দেখুন` : undefined}
          style={{ "--p": primary } as CSSProperties}
          className={`group/card relative min-h-[200px] overflow-hidden rounded-[22px] bg-[#F3EDE4] ring-1 ring-[#EEEAE4] shadow-[0_14px_32px_-20px_rgba(25,25,25,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_50px_-24px_color-mix(in_srgb,var(--p)_55%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p)] focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 lg:min-h-[180px] ${
            c.open ? "cursor-pointer" : ""
          }`}
        >
          {/* Image: full bleed, fills the whole card */}
          {c.image ? (
            <img
              src={c.image}
              alt={c.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-110 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-[13px] text-[#C9C2B8]">পণ্যের ছবি</span>
          )}

          {/* soft dark floor so the glass panel always reads well */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(25,25,25,0.42)_0%,rgba(25,25,25,0)_55%)]"
          />

          {/* oily gloss sweep */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="absolute -bottom-[30%] -top-[30%] left-0 w-[36%] bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.5),transparent)] animate-[heroFeatSheen_6s_ease-in-out_infinite] motion-reduce:animate-none" />
          </span>

          {/* light that follows the pointer */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
            style={{
              background:
                "radial-gradient(180px circle at var(--mx, 50%) var(--my, 30%), rgba(255,255,255,0.38), transparent 65%)",
            }}
          />

          {/* Badge */}
          <span className="absolute left-3 top-3 z-[1] rounded-full bg-[var(--p)] px-2.5 py-1 text-[10.5px] font-bold leading-none text-white shadow-[0_6px_16px_-6px_color-mix(in_srgb,var(--p)_60%,transparent)]">
            সেরা {toBn(i + 1)}
          </span>

          {/* Always-visible click cue: pulsing arrow orb (turns solid on hover) */}
          {c.open && (
            <span aria-hidden="true" className="absolute right-3 top-3 z-[1] flex h-9 w-9 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-white/70 animate-ping [animation-duration:2.4s] group-hover/card:animate-none motion-reduce:animate-none" />
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[var(--p)] shadow-[inset_0_1px_0_#fff,0_4px_10px_-4px_rgba(25,25,25,0.4)] transition-all duration-300 group-hover/card:scale-110 group-hover/card:bg-[var(--p)] group-hover/card:text-white">
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </span>
            </span>
          )}

          {/* ===== Glass panel (compact: price + action on one row) ===== */}
          <div className="absolute inset-x-3 bottom-3 z-[1] rounded-2xl border border-white/60 bg-white/55 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_-12px_rgba(25,25,25,0.45)] backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300 group-hover/card:bg-white/70">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,rgba(255,255,255,0.55),rgba(255,255,255,0)_45%,color-mix(in_srgb,var(--p)_10%,transparent))]"
            />

            <div className="relative">
              <h3 title={c.name} className="line-clamp-1 text-[14.5px] font-bold leading-snug text-[#191919]">
                {c.name}
              </h3>

              <div className="mt-1.5 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-baseline gap-1.5">
                  <span className="text-[19px] font-black leading-none tracking-tight text-[#191919]">
                    <span className="mr-0.5 text-[13px] font-extrabold text-[var(--p)]">৳</span>
                    {toBn(c.price)}
                  </span>
                  {c.compare > c.price && (
                    <s className="text-[11.5px] font-medium text-[#6B645B] decoration-[#A39B90]">৳{toBn(c.compare)}</s>
                  )}
                </div>

                {/* Action slot: idle text cue  <->  hover button (same spot, cross-fade) */}
                {c.open && (
                  <div className="relative h-9 w-9 shrink-0 sm:w-[116px]">
                    <span className="absolute inset-0 hidden items-center justify-end gap-1.5 text-[12.5px] font-bold text-[var(--p)] transition-all duration-300 group-hover/card:-translate-y-1 group-hover/card:opacity-0 group-focus-within/card:-translate-y-1 group-focus-within/card:opacity-0 sm:flex [@media(hover:none)]:hidden">
                      অর্ডার করুন
                      <svg
                        viewBox="0 0 16 16"
                        width="11"
                        height="11"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-[heroFeatNudge_1.4s_ease-in-out_infinite] motion-reduce:animate-none"
                      >
                        <path d="M3 8h10M9 4l4 4-4 4" />
                      </svg>
                    </span>

                    <button
                      type="button"
                      aria-label="অর্ডার করুন"
                      className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--p)] text-[12.5px] font-bold text-white shadow-[0_8px_18px_-8px_color-mix(in_srgb,var(--p)_60%,transparent)] transition-all duration-300 hover:bg-[#191919] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p)] focus-visible:ring-offset-2 motion-reduce:transition-none sm:translate-y-2 sm:opacity-0 sm:group-hover/card:translate-y-0 sm:group-hover/card:opacity-100 sm:focus-visible:translate-y-0 sm:focus-visible:opacity-100 sm:[@media(hover:none)]:translate-y-0 sm:[@media(hover:none)]:opacity-100"
                    >
                      <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
                        <path d="M9 1 3 9h4l-1 6 7-9H9l0-5Z" />
                      </svg>
                      <span className="hidden sm:inline">অর্ডার করুন</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  </>
)}
    </div>
  );
}