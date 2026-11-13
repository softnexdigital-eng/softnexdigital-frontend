import type { Variant } from '@/types';

export type PublicVariant = {
  id: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  image?: string | null;
  attributes: Record<string, string>;
};

export type PublicProduct = {
  id: string;
  name: string;
  slug?: string;
  images: string[];
  categories?: { id: string; name: string }[];
  variants: PublicVariant[];
  attributeTemplates?: { id?: string; name: string; options?: string[] }[];
  attributeNames?: string[];
};

export function normalizeAttr(value: unknown): string {
  if (value == null) return '';
  if (Array.isArray(value)) return value.length ? String(value[0]).trim() : '';
  if (typeof value === 'string') {
    const t = value.trim();
    if (t.startsWith('[') && t.endsWith(']')) {
      try {
        const parsed = JSON.parse(t);
        if (Array.isArray(parsed) && parsed.length) return String(parsed[0]).trim();
      } catch {
        // fall through
      }
    }
    return t;
  }
  return String(value).trim();
}

export function normalizeAttributes(
  attrs: Record<string, unknown> | undefined | null,
  productName?: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!attrs || typeof attrs !== 'object' || Array.isArray(attrs)) return out;
  const pName = (productName || '').trim().toLowerCase();
  for (const [k, v] of Object.entries(attrs)) {
    const key = String(k).trim();
    if (!key || key.toLowerCase() === 'name') continue;
    const nv = normalizeAttr(v);
    if (!nv) continue;
    if (pName && nv.trim().toLowerCase() === pName) continue;
    out[key] = nv;
  }
  return out;
}

export function getAttributeOptions(variants: PublicVariant[], productName?: string): Record<string, string[]> {
  const order: Record<string, string[]> = {};
  const seen: Record<string, Set<string>> = {};
  for (const v of variants || []) {
    const attrs = normalizeAttributes(v.attributes as unknown as Record<string, unknown>, productName);
    for (const [key, val] of Object.entries(attrs)) {
      if (!seen[key]) { seen[key] = new Set(); order[key] = []; }
      if (!seen[key].has(val)) {
        seen[key].add(val);
        order[key].push(val);
      }
    }
  }
  return order;
}

export function findVariant(
  variants: PublicVariant[],
  selected: Record<string, string>,
  productName?: string,
): PublicVariant | undefined {
  if (!variants || variants.length === 0) return undefined;
  const keys = Object.keys(selected || {}).filter((k) => selected[k]);
  if (keys.length === 0) return undefined;
  return variants.find((v) => {
    const attrs = normalizeAttributes(v.attributes as unknown as Record<string, unknown>, productName);
    return keys.every((k) => attrs[k] === selected[k]);
  });
}

export function findBestVariantForSelection(
  variants: PublicVariant[],
  selected: Record<string, string>,
  changedKey: string,
  changedVal: string,
  productName?: string,
): PublicVariant | undefined {
  const exact = findVariant(variants, { ...selected, [changedKey]: changedVal }, productName);
  if (exact) return exact;
  const candidates = (variants || []).filter((v) => {
    const attrs = normalizeAttributes(v.attributes as unknown as Record<string, unknown>, productName);
    return attrs[changedKey] === changedVal;
  });
  if (!candidates.length) return undefined;
  const inStock = candidates.filter((v) => (v.stock ?? 0) > 0);
  return (inStock[0] || candidates[0]);
}

export function isOptionAvailable(
  variants: PublicVariant[],
  selected: Record<string, string>,
  key: string,
  val: string,
  productName?: string,
): boolean {
  const test: Record<string, string> = { ...selected, [key]: val };
  return (variants || []).some((v) => {
    if ((v.stock ?? 0) <= 0) return false;
    const attrs = normalizeAttributes(v.attributes as unknown as Record<string, unknown>, productName);
    return Object.entries(test).every(([k, sv]) => !sv || attrs[k] === sv);
  });
}

export function getDefaultVariant(variants: PublicVariant[]): PublicVariant | undefined {
  if (!variants || variants.length === 0) return undefined;
  const inStock = variants.filter((v) => (v.stock ?? 0) > 0);
  const pool = inStock.length > 0 ? inStock : variants;
  // cheapest preferred among pool
  return [...pool].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))[0];
}

export function getDiscountPercent(variant: PublicVariant | undefined | null): number {
  if (!variant) return 0;
  const price = Number(variant.price) || 0;
  const compare = Number(variant.compareAtPrice) || 0;
  if (compare > price && price > 0) {
    return Math.round(((compare - price) / compare) * 100);
  }
  return 0;
}

// Convert raw Variant (from types) to PublicVariant shape safely
export function toPublicVariant(v: Variant): PublicVariant {
  return {
    id: v.id,
    sku: v.sku,
    price: Number(v.price) || 0,
    compareAtPrice: v.compareAtPrice ?? null,
    stock: Number(v.stock) || 0,
    image: v.image ?? null,
    attributes: normalizeAttributes(v.attributes as unknown as Record<string, unknown>),
  };
}
