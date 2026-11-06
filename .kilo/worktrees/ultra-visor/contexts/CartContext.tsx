'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  attributes: Record<string, string>;
  sku: string;
  stock: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  image: string;
  price: number;
  attributes: Record<string, string>;
}

interface CartContextType {
  items: CartItem[];
  wishlist: WishlistItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (variantId: string) => Promise<void>;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  addToWishlist: (item: Omit<WishlistItem, 'id'>) => void;
  removeFromWishlist: (variantId: string) => void;
  isInWishlist: (variantId: string) => boolean;
  isInCart: (variantId: string) => boolean;
  loading: boolean;
  sessionId: string;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {}
  return fallback;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadFromStorage('ecommerce_cart', []));
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => loadFromStorage('ecommerce_wishlist', []));
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const itemsRef = useRef(items);
  const wishlistRef = useRef(wishlist);
  itemsRef.current = items;
  wishlistRef.current = wishlist;

  // Initialize sessionId on mount
  useEffect(() => {
    let sid = localStorage.getItem('cart_session_id');
    if (!sid) {
      sid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cart_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  // Save to localStorage whenever state changes
  const persistCart = useCallback((newItems: CartItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ecommerce_cart', JSON.stringify(newItems));
    }
  }, []);

  const persistWishlist = useCallback((newWishlist: WishlistItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ecommerce_wishlist', JSON.stringify(newWishlist));
    }
  }, []);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const removeFromCart = useCallback(async (variantId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.delete(`/cart/remove/${variantId}`).catch(() => {});
      } else if (sessionId) {
        try {
          await api.delete(`/public/cart/remove/${variantId}?sessionId=${sessionId}`);
        } catch (err) {
          console.warn('Failed to sync cart removal');
        }
      }
      setItems(prev => {
        const updated = prev.filter(i => i.variantId !== variantId);
        persistCart(updated);
        return updated;
      });
      showToast.success('Removed from cart');
    } catch {
      showToast.error('Failed to remove item');
    } finally {
      setLoading(false);
    }
  }, [persistCart, sessionId]);

  const addToCart = useCallback(async (item: Omit<CartItem, 'id'>) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/cart/add', {
          variantId: item.variantId,
          quantity: item.quantity,
        }).catch(() => {});
      } else if (sessionId) {
        try {
          await api.post('/public/cart/add', {
            sessionId,
            variantId: item.variantId,
            quantity: item.quantity,
          });
        } catch (err) {
          console.warn('Failed to sync cart to backend');
        }
      }

      setItems(prev => {
        const existing = prev.find(i => i.variantId === item.variantId);
        let updated: CartItem[];
        if (existing) {
          updated = prev.map(i =>
            i.variantId === item.variantId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        } else {
          updated = [...prev, { ...item, id: Date.now().toString() }];
        }
        persistCart(updated);
        return updated;
      });
      showToast.success('Added to cart!');
    } catch {
      showToast.error('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  }, [persistCart, sessionId]);

  const updateQuantity = useCallback(async (variantId: string, quantity: number) => {
    const currentItems = itemsRef.current;
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.put('/cart/update', { variantId, quantity }).catch(() => {});
      } else if (sessionId) {
        try {
          await api.put('/public/cart/update', {
            sessionId,
            variantId,
            quantity
          });
        } catch (err) {
          console.warn('Failed to sync cart update');
        }
      }
      setItems(prev => {
        const updated = prev.map(i =>
          i.variantId === variantId ? { ...i, quantity } : i
        );
        persistCart(updated);
        return updated;
      });
    } catch {
      showToast.error('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  }, [persistCart, removeFromCart, sessionId]);

  const clearCart = useCallback(() => {
    setItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ecommerce_cart');
    }
  }, []);

  const addToWishlist = useCallback(async (item: Omit<WishlistItem, 'id'>) => {
    try {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          await api.post('/wishlist/add', {
            variantId: item.variantId,
          });
        } catch (err) {
          console.warn('Failed to sync wishlist to backend');
        }
      } else if (sessionId) {
        try {
          await api.post('/public/wishlist/add', {
            sessionId,
            variantId: item.variantId,
          });
        } catch (err) {
          console.warn('Failed to sync wishlist to backend');
        }
      }

      const currentWishlist = wishlistRef.current;
      if (currentWishlist.some(i => i.variantId === item.variantId)) {
        toast('Already in wishlist');
        return;
      }
      const newItem = { ...item, id: Date.now().toString() };
      const updated = [...currentWishlist, newItem];
      setWishlist(updated);
      persistWishlist(updated);
      showToast.success('Added to wishlist!');
    } catch (err) {
      showToast.error('Failed to add to wishlist');
    }
  }, [persistWishlist, sessionId]);

  const removeFromWishlist = useCallback((variantId: string) => {
    setWishlist(prev => {
      const itemToRemove = prev.find(w => w.variantId === variantId);

      if (itemToRemove) {
        const token = localStorage.getItem('token');
        if (token) {
          api.delete(`/wishlist/remove/${itemToRemove.id}`).catch(() => {});
        } else if (sessionId) {
          api.delete(`/public/wishlist/remove/${variantId}`, {
            data: { sessionId }
          }).catch(() => {});
        }
      }

      const updated = prev.filter(i => i.variantId !== variantId);
      persistWishlist(updated);
      return updated;
    });
    showToast.success('Removed from wishlist');
  }, [persistWishlist, sessionId]);

  const isInWishlist = useCallback((variantId: string) => {
    return wishlistRef.current.some(i => i.variantId === variantId);
  }, []);

  const isInCart = useCallback((variantId: string) => {
    return itemsRef.current.some(i => i.variantId === variantId);
  }, []);

  return (
    <CartContext.Provider value={{
      items, wishlist, addToCart, updateQuantity, removeFromCart, clearCart,
      cartCount, cartTotal, addToWishlist, removeFromWishlist, isInWishlist,
      isInCart, loading, sessionId
    }}>
      {children}
    </CartContext.Provider>
  );
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}