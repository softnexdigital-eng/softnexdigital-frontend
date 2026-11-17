"use client";

interface CategoryNavStripProps {
  categories: Array<{ id: string; name: string }>;
  selectedCategory: string | null;
  onSelectCategory: (id: string) => void;
  primary: string;
  placeholder?: boolean;
}

export default function CategoryNavStrip({
  categories,
  selectedCategory,
  onSelectCategory,
  primary,
  placeholder = false,
}: CategoryNavStripProps) {
  const isPlaceholder = !categories?.length && placeholder;
  const list = isPlaceholder ? [] : categories || [];
  if (list.length === 0) return null;

  return (
    <nav aria-label="ক্যাটাগরি" className="border-b border-[#e7e8ec] bg-white">
      {/* first:ml-auto / last:mr-auto = "safe center": centred when it fits, scrollable from the left when it overflows */}
      <div className="mx-auto flex h-12 max-w-[1280px] items-center gap-8 overflow-x-auto whitespace-nowrap px-5 text-[15px] font-semibold scrollbar-hide md:gap-[34px]">
        {list.map((c) => {
          const active = !isPlaceholder && selectedCategory === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => !isPlaceholder && onSelectCategory(c.id)}
              aria-current={active ? "true" : undefined}
              className="relative flex h-full flex-shrink-0 items-center transition-colors first:ml-auto last:mr-auto hover:opacity-80"
              style={{ color: active ? primary : "#17181c" }}
            >
              {c.name}
              {active && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full" style={{ background: primary }} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}