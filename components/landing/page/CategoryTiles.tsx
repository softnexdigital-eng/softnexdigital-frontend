"use client";

import { PLACEHOLDER_CATEGORIES } from "./Placeholders";

interface CategoryTilesProps {
  categories: Array<{ id: string; name: string; image?: string | null }>;
  onSelectCategory: (id: string) => void;
  primary?: string;
  placeholder?: boolean;
}

export default function CategoryTiles({
  categories,
  onSelectCategory,
  primary = "#da240c",
  placeholder = false,
}: CategoryTilesProps) {
  const isPlaceholder = !categories?.length && placeholder;
  const list = (isPlaceholder ? PLACEHOLDER_CATEGORIES : categories || []).slice(0, 7);
  if (list.length === 0) return null;

  return (
    <section className="relative mt-7 px-4 md:mt-10 md:px-6 lg:mt-12 lg:px-8">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-6 -z-10 mx-auto h-32 max-w-2xl rounded-full opacity-40 blur-3xl"
        style={{ background: `radial-gradient(ellipse at center, ${primary}22, transparent 70%)` }}
      />

      {/* Header */}
      <div className="mb-4 flex items-end justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg text-white shadow-md"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${primary}cc)`,
              boxShadow: `0 6px 14px -4px ${primary}66`,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </span>
          <div>
            <h2 className="text-[18px] font-bold leading-tight tracking-tight" style={{ color: primary }}>
              ক্যাটাগরি অনুযায়ী কিনুন
            </h2>
           
          </div>
        </div>
        <button
          type="button"
          className="group/all hidden items-center gap-1 rounded-full border border-[#e7e8ec] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#4b5058] transition-all hover:border-transparent hover:text-white sm:inline-flex"
          onMouseEnter={(e) => (e.currentTarget.style.background = primary)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
        >
          সব দেখুন
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/all:translate-x-0.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Grid — tighter gaps */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 lg:gap-2.5">
        {list.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => !isPlaceholder && onSelectCategory(c.id)}
            className="group/tile relative flex flex-col gap-1.5 overflow-hidden rounded-xl border border-[#e7e8ec] bg-white p-2 text-center text-[11.5px] font-semibold text-[#17181c] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_14px_28px_-10px_rgba(0,0,0,0.18)] active:translate-y-0 active:scale-[0.98] animate-[fadeUp_0.5s_ease-out_both]"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            {/* Top accent bar */}
            <span
              className="absolute inset-x-0 top-0 h-[2.5px] origin-left scale-x-0 transition-transform duration-300 group-hover/tile:scale-x-100"
              style={{ background: `linear-gradient(90deg, ${primary}, ${primary}66)` }}
            />

            {/* Radial glow */}
            <span
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100"
              style={{ background: `radial-gradient(circle at 50% 0%, ${primary}10, transparent 65%)` }}
            />

            {/* Image — fixed small square */}
            <span className="relative block mx-auto aspect-square w-full max-w-[72px] overflow-hidden rounded-lg bg-gradient-to-br from-[#f3f4f7] to-[#e8eaef] ring-1 ring-black/[0.03]">
              {c.image ? (
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/tile:scale-110"
                />
              ) : (
                <span className="grid h-full w-full place-items-center text-[9px] text-[#9aa0aa]">
                  ছবি
                </span>
              )}
              {/* Shine sweep */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover/tile:translate-x-full" />
              {/* Inner ring on hover */}
              <span
                className="pointer-events-none absolute inset-0 rounded-lg ring-0 ring-inset transition-all duration-300 group-hover/tile:ring-2"
                style={{ ["--tw-ring-color" as any]: `${primary}33` }}
              />
            </span>

            {/* Label */}
            <span className="relative line-clamp-1 text-[11.5px] leading-tight transition-colors duration-200 group-hover/tile:text-[#0f1013]">
              {c.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}