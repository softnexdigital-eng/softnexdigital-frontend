const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/** 450 -> "৪৫০", 1000 -> "১,০০০" (deterministic, safe for SSR/hydration) */
export const toBn = (n: number | string): string =>
  (typeof n === "number" ? Math.round(n || 0).toLocaleString("en-US") : n).replace(
    /\d/g,
    (d) => BN_DIGITS[Number(d)]
  );

export const PLACEHOLDER_ANNOUNCEMENT = "দোকানের ঘোষণা বা অফারের লেখা এখানে বসবে";
export const PLACEHOLDER_BANNER_TEXT = "ব্যানার স্লাইড, দোকানদার আপলোড করবেন (৬০০০×৪০০)";
export const PLACEHOLDER_LOGO_TEXT = "লোগো";

export const PLACEHOLDER_CATEGORIES = Array.from({ length: 7 }, (_, i) => ({
  id: `placeholder-${i + 1}`,
  name: `ক্যাটাগরি ${toBn(i + 1)}`,
  image: null as string | null,
}));

export const PLACEHOLDER_FEATURED = [
  { id: "placeholder-1", name: "সেরা পণ্যের নাম এখানে", price: 450, compare: 0 },
  { id: "placeholder-2", name: "সেরা পণ্যের নাম এখানে", price: 800, compare: 1000 },
];