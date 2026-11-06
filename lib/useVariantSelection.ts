import { useCallback, useEffect, useMemo, useState } from "react";
import type { Variant } from "@/types";

/**
 * Data model this hook assumes (it is what the rest of your app already does):
 *   - A Variant is one orderable listing: its own image, price, stock, SKU.
 *   - variant.attributes holds the OPTIONS the buyer can pick inside that variant,
 *     e.g. { size: ["XL","M","XXL"], color: "Blue-White" }.
 *   - What gets ordered = variantId + one chosen value per attribute.
 * Values may arrive as an array, a JSON string ('["XL","M"]'), a comma string
 * ("XL, M") or a plain string, so everything goes through parseAttrValues().
 */

export const parseAttrValues = (value: unknown): string[] => {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    const t = value.trim();
    if (!t) return [];
    if (t.startsWith("[") && t.endsWith("]")) {
      try {
        const p = JSON.parse(t);
        if (Array.isArray(p)) return p.map((v) => String(v).trim()).filter(Boolean);
      } catch {
        /* fall through */
      }
    }
    if (t.includes(",")) return t.split(",").map((s) => s.trim()).filter(Boolean);
    return [t];
  }
  return [String(value)];
};

export type AttributeGroup = { name: string; options: string[] };

export const getAttributeGroups = (variant?: Variant | null): AttributeGroup[] => {
  const attrs = (variant as any)?.attributes;
  if (!attrs) return [];
  return Object.entries(attrs)
    .map(([name, raw]) => ({ name, options: Array.from(new Set(parseAttrValues(raw))) }))
    .filter((g) => g.options.length > 0);
};

/** Names of attributes the buyer still has to choose (empty array = ready to order). */
export const getMissingAttributes = (
  variant: Variant | null | undefined,
  selected: Record<string, string> | undefined,
): string[] =>
  getAttributeGroups(variant)
    .filter((g) => !selected?.[g.name])
    .map((g) => g.name);

interface UseVariantSelectionInput {
  variants?: Variant[];
  selectedVariantId?: string | null;
  [key: string]: any; // HeroSection spreads the product in; extra keys are ignored
}

const EMPTY: Variant[] = [];

export function useVariantSelection(input: UseVariantSelectionInput) {
  const variants = input.variants ?? EMPTY;
  const externalId = input.selectedVariantId ?? null;

  const [variantId, setVariantId] = useState<string | null>(externalId);
  const [picked, setPicked] = useState<Record<string, string>>({});

  // Parent chose a different variant (grid card click, search suggestion, ...)
  useEffect(() => {
    if (externalId && externalId !== variantId) {
      setVariantId(externalId);
      setPicked({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalId]);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === variantId) ?? null,
    [variants, variantId],
  );

  const groups = useMemo(() => getAttributeGroups(selectedVariant), [selectedVariant]);

  // Single-option attributes (e.g. only "XXL", only "Blue-White") are auto-selected.
  const selectedAttributes = useMemo(() => {
    const out: Record<string, string> = {};
    for (const g of groups) {
      if (g.options.length === 1) out[g.name] = g.options[0];
      else if (picked[g.name] && g.options.includes(picked[g.name])) {
        out[g.name] = picked[g.name];
      }
    }
    return out;
  }, [groups, picked]);

  const isComplete = !!selectedVariant && groups.every((g) => !!selectedAttributes[g.name]);
  const inStock = !!selectedVariant && (selectedVariant as any).stock > 0;

  // Stock lives on the variant, so an option is available iff the variant is in stock.
  // (Per-size stock needs one record per size/color combination.)
  const isAvailable = useCallback(() => inStock, [inStock]);

  const selectAttribute = useCallback(
    (name: string, value: string): Variant | null => {
      setPicked((prev) => ({ ...prev, [name]: value }));
      return selectedVariant;
    },
    [selectedVariant],
  );

  const selectVariant = useCallback((v: Variant) => {
    setVariantId(v.id);
    setPicked({});
  }, []);

  return {
    groups,
    selectedAttributes,
    selectedVariant,
    isComplete,
    isAvailable,
    selectAttribute,
    selectVariant,
  };
}