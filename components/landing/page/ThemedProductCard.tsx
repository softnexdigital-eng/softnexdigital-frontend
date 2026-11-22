'use client';

import ProductCard from '@/components/ProductCard';
import ProductCardRed from '@/components/ProductCardRed';
import ProductCardBlue from '@/components/ProductCardBlue';

type ThemedProductCardProps = React.ComponentProps<typeof ProductCard> & {
  theme?: string;
};

/* Renders the theme-appropriate product card:
   - grocery / fruits  → red grocery card (ProductCardRed)
   - original / default / clothing / electronics / anything else → blue general-store card (ProductCardBlue)
   The original ProductCard is kept untouched for backward compatibility. */
export default function ThemedProductCard({ theme, ...props }: ThemedProductCardProps) {
  const isRedTheme = theme === 'grocery' || theme === 'fruits';
  const Card = isRedTheme ? ProductCardRed : ProductCardBlue;
  return <Card {...props} />;
}
