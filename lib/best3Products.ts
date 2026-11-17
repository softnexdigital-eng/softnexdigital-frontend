import api from './api';

export interface Best3ProductEntry {
  id: string;
  tenantId: string;
  productId: string;
  variantId?: string | null;
  displayOrder: number;
  isActive: boolean;
  product?: {
    id: string;
    name: string;
    slug?: string;
    basePrice?: number | null;
    variants?: any[];
    brand?: { id: string; name: string } | null;
    imagesRel?: any[];
  };
}

export interface PreOrderVariant {
  id: string;
  productId: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number | null;
  costPrice: number;
  stock: number;
  image?: string | null;
  supplierId?: string | null;
  isPreOrder: boolean;
  preOrderEstimatedDelivery?: string | null;
  preOrderPrice?: number | null;
  product?: { id: string; name: string; slug?: string; basePrice?: number | null };
}

export const best3ProductApi = {
  list: async (): Promise<{ data: Best3ProductEntry[]; success: boolean }> => {
    const response = await api.get('/best3-products');
    return response.data;
  },
  set: async (productIds: string[]): Promise<{ data: any; success: boolean }> => {
    const response = await api.post('/best3-products', { productIds });
    return response.data;
  },
  toggle: async (id: string, isActive: boolean): Promise<{ data: any; success: boolean }> => {
    const response = await api.patch(`/best3-products/${id}/toggle`, { isActive });
    return response.data;
  },
  remove: async (id: string): Promise<{ data: any; success: boolean }> => {
    const response = await api.delete(`/best3-products/${id}`);
    return response.data;
  },
};

export const preOrderApi = {
  list: async (): Promise<{ data: PreOrderVariant[]; success: boolean }> => {
    const response = await api.get('/preorder');
    return response.data;
  },
  listEnabled: async (): Promise<{ data: PreOrderVariant[]; success: boolean }> => {
    const response = await api.get('/preorder/enabled');
    return response.data;
  },
  toggle: async (id: string, isPreOrder: boolean): Promise<{ data: any; success: boolean }> => {
    const response = await api.patch(`/preorder/${id}/toggle`, { isPreOrder });
    return response.data;
  },
  updateSettings: async (id: string, settings: { isPreOrder?: boolean; preOrderEstimatedDelivery?: string; preOrderPrice?: number | null }): Promise<{ data: any; success: boolean }> => {
    const response = await api.put(`/preorder/${id}`, settings);
    return response.data;
  },
};
