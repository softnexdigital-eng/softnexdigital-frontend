/**
 * Admin Product Management Types
 * Defines all TypeScript interfaces for the product admin dashboard.
 */

/** Category – self-referential parent/child for sub-categories */
export interface AdminCategory {
  id: string;
  tenantId?: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  image?: string;
  isActive: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  parent?: { id: string; name: string; slug: string } | null;
  children?: AdminCategory[];
  _count?: { products: number };
}

/** Brand */
export interface AdminBrand {
  id: string;
  tenantId?: string;
  name: string;
  slug: string;
  logo?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: { products: number };
}

/** Supplier */
export interface AdminSupplier {
  id: string;
  tenantId?: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Product (extended for admin view) */
export interface AdminProduct {
  id: string;
  tenantId?: string;
  name: string;
  description?: string;
  basePrice?: number;
  images: string[];
  slug?: string;
  sku?: string;
  status?: string;
  isActive?: boolean;
  stock?: number;
  createdAt: string;
  updatedAt?: string;
  brandId?: string | null;
  brand?: { id: string; name: string; slug: string; logo?: string } | null;
  categories?: Array<{ category: { id: string; name: string; slug: string } }>;
  variants?: Array<{
    id: string;
    sku: string;
    price: number;
    stock: number;
    attributes: Record<string, string>;
  }>;
  imagesRel?: Array<{ id: string; url: string; altText?: string; isPrimary: boolean }>;
  supplierId?: string | null;
  supplier?: { id: string; name: string } | null;
  _count?: { variants: number };
}

/** Navigation items for the admin sidebar */
export type AdminSection =
  | 'products'
  | 'categories'
  | 'subcategories'
  | 'brands'
  | 'suppliers';