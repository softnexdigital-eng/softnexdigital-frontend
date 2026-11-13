import Link from "next/link";
import type { NavCategory } from "./data";

interface CategoryNavProps {
  categories: NavCategory[];
  className?: string;
}

export default function CategoryNav({ categories, className }: CategoryNavProps) {
  return (
    <nav
      aria-label="Top categories"
      className={`w-full border-b border-gray-200 bg-white shadow-sm ${className ?? ""}`}
    >
      <div className="h-11 sm:h-[44px]">
        <ul className="flex h-full items-center gap-10 overflow-x-auto whitespace-nowrap px-4 sm:justify-center sm:px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <li key={cat.id} className="shrink-0">
              <Link
                href={cat.href}
                className="group inline-flex h-11 items-center text-base font-medium text-gray-800 transition-colors hover:text-[var(--store-green)] focus-visible:text-[var(--store-green)] focus-visible:outline-none"
              >
                <span className="relative">
                  {cat.label}
                  <span className="absolute -bottom-[6px] left-0 h-[2px] w-0 bg-[var(--store-green)] transition-all duration-200 group-hover:w-full group-focus-visible:w-full" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
