import type { NavCategory, Slide, Banner, ShopCategory } from "./data";
import { defaultNavCategories, defaultSlides, defaultBanners, defaultShopCategories } from "./data";
import CategoryNav from "./CategoryNav";
import HeroSlider from "./HeroSlider";
import SideBanners from "./SideBanners";

interface HeaderProps {
  navCategories?: NavCategory[];
  slides?: Slide[];
  sideBanners?: Banner[];
  className?: string;
}

export default function Header({
  navCategories = defaultNavCategories,
  slides = defaultSlides,
  sideBanners = defaultBanners,
  className,
}: HeaderProps) {
  return (
    <header className={className ?? ""}>
      <CategoryNav categories={navCategories} />
      <section
        aria-label="Featured"
        className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr] lg:items-stretch">
          <HeroSlider slides={slides} className="h-full" />
          <div className="hidden h-full lg:block">
            <SideBanners banners={sideBanners} className="h-full" />
          </div>
        </div>
        <div className="mt-5 lg:hidden">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {sideBanners.map((b) => (
              <a
                key={b.id}
                href={b.href}
                aria-label={b.alt}
                className="relative block aspect-[16/9] w-[82%] shrink-0 snap-start overflow-hidden rounded-2xl bg-gray-100"
              >
                <img
                  src={b.image}
                  alt={b.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
              </a>
            ))}
          </div>
        </div>
      </section>
    </header>
  );
}

export type { NavCategory, Slide, Banner, ShopCategory };
export { CategoryNav, HeroSlider, SideBanners, CategoryGrid } from "./index";
