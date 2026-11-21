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
    <section className="relative mt-7 md:mt-10 lg:mt-12">
      {/* Header */}
      <div className="mb-3 flex items-end justify-between">
        <div className="flex items-center gap-2">
          <span
            className="grid h-6 w-6 place-items-center rounded-md text-white shadow-sm"
            style={{ background: primary }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </span>
          <h2 className="text-[15px] font-bold leading-tight tracking-tight" style={{ color: primary }}>
            ক্যাটাগরি অনুযায়ী কিনুন
          </h2>
        </div>

        <button
          type="button"
          className="group/all hidden items-center gap-1 rounded-full border border-[#e7e8ec] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#4b5058] transition-all hover:border-transparent hover:text-white sm:inline-flex"
          onMouseEnter={(e) => (e.currentTarget.style.background = primary)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
        >
          সব দেখুন
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* 1/4th scale grid */}
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-14">
        {list.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => !isPlaceholder && onSelectCategory(c.id)}
            className="group/tile flex flex-col overflow-hidden rounded-lg border border-[#e7e8ec] bg-white text-center text-[9.5px] font-semibold text-[#17181c] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="relative block aspect-square w-full overflow-hidden bg-[#f3f4f7]">
              {c.image ? (
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover/tile:scale-105"
                />
              ) : (
                <span className="grid h-full w-full place-items-center text-[8px] text-[#9aa0aa]">
                  ছবি
                </span>
              )}
            </span>
            <span className="line-clamp-1 w-full px-1 py-1 text-[9.5px] leading-none">
              {c.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}