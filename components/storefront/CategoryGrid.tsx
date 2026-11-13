import Image from "next/image";
import Link from "next/link";
import type { ShopCategory } from "./data";

interface CategoryGridProps {
  categories: ShopCategory[];
  title?: string;
  className?: string;
}

export default function CategoryGrid({
  categories,
  title = "Shop by Category",
  className,
}: CategoryGridProps) {
  return (
    <section aria-labelledby="shop-by-category-heading" className={className ?? ""}>
      <h2
        id="shop-by-category-heading"
        className="mt-6 text-2xl font-medium text-gray-900"
      >
        {title}
      </h2>

      <div className="mt-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:overflow-visible sm:pb-0">
        <div className="flex snap-x snap-mandatory justify-start gap-5 px-1 sm:flex-wrap sm:justify-center sm:px-0">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group flex h-[135px] w-[130px] shrink-0 snap-start flex-col items-center rounded-xl border border-gray-200 bg-white p-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--store-green)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-green)]"
            >
              <div className="relative flex h-[76px] w-full items-center justify-center">
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  loading="lazy"
                  sizes="130px"
                  className="object-contain p-1"
                />
              </div>
              <span className="mt-auto w-full truncate text-center text-xs font-semibold uppercase tracking-wide text-gray-700">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
