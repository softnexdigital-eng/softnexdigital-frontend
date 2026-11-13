import Image from "next/image";
import Link from "next/link";
import type { Banner } from "./data";

interface SideBannersProps {
  banners: Banner[];
  className?: string;
}

export default function SideBanners({ banners, className }: SideBannersProps) {
  const items = banners.slice(0, 2);
  if (items.length === 0) return null;

  return (
    <div className={`flex h-full flex-col gap-5 ${className ?? ""}`}>
      {items.map((banner, i) => (
        <Link
          key={banner.id}
          href={banner.href}
          aria-label={banner.alt}
          className="group relative block w-full flex-1 overflow-hidden rounded-2xl bg-gray-100"
        >
          <div className="relative h-full min-h-[160px] w-full lg:min-h-0">
            <Image
              src={banner.image}
              alt={banner.alt}
              fill
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              priority={false}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
