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
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-3 overflow-x-auto whitespace-nowrap px-5 text-[15px] font-semibold scrollbar-hide md:gap-4">
        {list.map((c) => {
          const active = !isPlaceholder && selectedCategory === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => !isPlaceholder && onSelectCategory(c.id)}
              aria-current={active ? "true" : undefined}
              className={`relative flex h-10 flex-shrink-0 items-center rounded-lg px-4 transition-all duration-200 ease-in-out first:ml-auto last:mr-auto active:scale-95 ${
                active
                  ? "border border-red-500 bg-red-50/60 text-red-600 shadow-sm"
                  : "border border-transparent text-orange-600 hover:border-orange-500 hover:bg-orange-50/40"
              }`}
            >
              <span className="transition-transform duration-200 hover:scale-[1.02]">
                {c.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}