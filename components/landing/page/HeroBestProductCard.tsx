import { FaBolt } from "react-icons/fa";
import type { Variant } from "@/types";
import { normalizeAttributes } from "@/lib/variants";

interface HeroBestProductCardProps {
  product: {
    id: string;
    name: string;
    images?: string[];
    variants?: Variant[];
  };
  addToCart: (variantId: string, qty?: number, attrs?: Record<string, string>) => void;
  onOpenDetails: (productId: string, variantId: string) => void;
}

export default function HeroBestProductCard({ product, addToCart, onOpenDetails }: HeroBestProductCardProps) {
  const variants = product.variants || [];
  const variant = variants[0] as Variant | undefined;
  const isPreOrder = variant?.isPreOrder || variant?.preOrderPrice != null;
  const price = variant?.preOrderPrice ?? (variant?.price || 0);
  const compareAtPrice = variant?.compareAtPrice;

  return (
    <div className="bg-white border border-[#e7e8ec] rounded-xl overflow-hidden flex flex-col h-[200px]">
      <div className="relative h-[130px] flex-shrink-0">
        <div className="w-44 h-full bg-gray-200 flex items-center justify-center text-gray-300 text-sm font-medium">
          পণ্যের ছবি
        </div>
        <span className="absolute top-2 left-2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 leading-none">
          প্রি-অর্ডার
        </span>
      </div>
      <div className="p-3 flex flex-col gap-2">
        <h3 className="text-[14px] font-semibold text-[#17181c] line-clamp-2 min-h-[2.1rem] leading-tight break-words">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-[18px] font-bold text-[#17181c]">৳{price}</span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-[12px] text-gray-500 line-through">৳{compareAtPrice}</span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (variant) addToCart(variant.id, 1, normalizeAttributes(variant.attributes as unknown as Record<string, unknown>, product.name) as Record<string, string>);
          }}
          className="w-full h-[36px] flex items-center justify-center gap-1.5 text-[13px] font-bold rounded-lg bg-[var(--primary,#e11d48)] text-white hover:bg-[var(--primary-dark,#be123c)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaBolt className="text-[12px]" /> {isPreOrder ? "প্রি-অর্ডার করুন" : "অর্ডার করুন"}
        </button>
      </div>
    </div>
  );
}
