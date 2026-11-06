'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiShoppingCart, FiPhone, FiHeart, FiShare2, FiStar, FiChevronLeft, FiChevronRight, FiX, FiCheck, FiChevronDown } from 'react-icons/fi';
import { ThemeConfig } from "@/app/[slug]/themeConfig";
import { Variant } from "@/types";

interface FashionThemeProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: {[key: string]: any};
  theme: ThemeConfig;
  variants: Variant[];
  selectedVariant: Variant | null;
  quantity: number;
  whatsappNumber: string;
  productImage: string | null;
  allImages: string[];
  displayLogo: string | null;
  displayPhone: string;
  displayPhone2: string;
  displayEmail: string;
  displayAddress: string;
  displaySocialLinks: {[key: string]: string};
  termsContent: string;
  companyName: string;
  isFreeDelivery: boolean;
  deliveryCharge: number;
  orderSuccess: { orderNumber: string } | null;
  orderLoading: boolean;
  showTerms: boolean;
  galleryIndex: number;
  openFaq: number | null;
  reviewIndex: number;
  isScrolled: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: {[key: string]: any};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleSubmit: any;
  setSelectedVariant: (v: Variant | null) => void;
  setQuantity: (n: number) => void;
  setOrderSuccess: (v: { orderNumber: string } | null) => void;
  setShowTerms: (v: boolean) => void;
  setGalleryIndex: (v: number) => void;
  setOpenFaq: (v: number | null) => void;
  setReviewIndex: (v: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmitOrder: (formData: { customerName: string; customerPhone: string; customerAddress: string; customerEmail: string; notes: string }) => void;
  videoUrl?: string;
}

export default function FashionTheme({
  data, theme, variants = [], selectedVariant, quantity, whatsappNumber,
  productImage, allImages = [], displayLogo, displayPhone, displayPhone2,
  displayEmail, displayAddress, displaySocialLinks, termsContent,
  companyName, isFreeDelivery, deliveryCharge, orderSuccess, orderLoading,
  showTerms, galleryIndex, openFaq, reviewIndex, isScrolled,
  errors, register, handleSubmit,
  setSelectedVariant, setQuantity, setOrderSuccess, setShowTerms,
  setGalleryIndex, setOpenFaq, setReviewIndex, onSubmitOrder, videoUrl,
}: FashionThemeProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const { page, product, tenant } = data || {};

  // Detect which attributes exist across all variants
  const allAttrKeys = useMemo(() => {
    if (variants.length === 0) return [];
    const keys = new Set<string>();
    variants.forEach(v => {
      if (v.attributes) Object.keys(v.attributes).forEach(k => keys.add(k));
    });
    return Array.from(keys);
  }, [variants]);

  // Determine primary and secondary attributes
  const hasColor = allAttrKeys.some(k => k.toLowerCase() === 'color');
  const hasSize = allAttrKeys.some(k => k.toLowerCase() === 'size');

  // For any attribute key (not Color/Size), treat as secondary
  const otherAttrs = allAttrKeys.filter(k => k.toLowerCase() !== 'color' && k.toLowerCase() !== 'size');

  // Define primary (first shown) and secondary (shown after primary selection) attribute keys
  const primaryAttrKey = hasColor ? allAttrKeys.find(k => k.toLowerCase() === 'color')! : null;
  const secondaryAttrKey = hasSize ? allAttrKeys.find(k => k.toLowerCase() === 'size')! : null;

  // Get all unique values for each attribute key
  const getAttrValues = (attrKey: string): string[] => {
    return [...new Set(variants.map(v => v.attributes?.[attrKey]).filter(Boolean))] as string[];
  };

  const primaryValues = primaryAttrKey ? getAttrValues(primaryAttrKey) : [];
  const secondaryValues = secondaryAttrKey ? getAttrValues(secondaryAttrKey) : [];

  // Get secondary values available for selected primary value
  const filteredSecondaryValues = selectedColor && secondaryAttrKey
    ? [...new Set(variants
        .filter(v => v.attributes?.[primaryAttrKey!] === selectedColor)
        .map(v => v.attributes?.[secondaryAttrKey!])
        .filter(Boolean))] as string[]
    : [];

  // Automatically select matching variant when both primary and secondary are selected
  useEffect(() => {
    if (selectedColor && selectedSize) {
      const matched = variants.find(v => {
        const matchesPrimary = primaryAttrKey ? v.attributes?.[primaryAttrKey] === selectedColor : true;
        const matchesSecondary = secondaryAttrKey ? v.attributes?.[secondaryAttrKey] === selectedSize : true;
        return matchesPrimary && matchesSecondary;
      });
      if (matched && matched.id !== selectedVariant?.id) {
        setSelectedVariant(matched);
        setQuantity(1);
        setTimeout(() => {
          document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, [selectedColor, selectedSize, primaryAttrKey, secondaryAttrKey, variants, setSelectedVariant, setQuantity, selectedVariant?.id]);

  // Build all display images
  const displayImages = useMemo(() => {
    return [
      ...(allImages || []),
      ...(variants.map(v => v.image).filter(Boolean) as string[]),
    ];
  }, [allImages, variants]);

  // Color name to hex mapping
  const colorHexMap: {[key: string]: string} = {
    black: '#000000', white: '#ffffff', gray: '#6b7280', grey: '#6b7280',
    silver: '#c0c0c0', gold: '#ffd700', beige: '#f5f5dc', khaki: '#c3b091',
    navy: '#000080', blue: '#3b82f6', lightblue: '#add8e6', skyblue: '#87ceeb',
    red: '#ef4444', maroon: '#800000', burgundy: '#800020', wine: '#722f37',
    pink: '#ec4899', rose: '#f43f5e', magenta: '#ff00ff', purple: '#8b5cf6',
    lavender: '#e6e6fa', violet: '#8f00ff',
    red: '#22c55e', olive: '#808000', teal: '#008080', mint: '#98ff98',
    red: '#eab308', red: '#f97316', coral: '#ff7f50', peach: '#ffdab9',
    brown: '#8b4513', tan: '#d2b48c', camel: '#c19a6b', chocolate: '#7b3f00',
    cream: '#fffdd0', ivory: '#fffff0',
  };

  const getColorHex = (colorName: string): string => {
    const lower = colorName.toLowerCase().trim();
    for (const [key, hex] of Object.entries(colorHexMap)) {
      if (lower.includes(key)) return hex;
    }
    if (lower.startsWith('#')) return lower;
    return '#ec4899';
  };

  const isLightColor = (hex: string): boolean => {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 180;
  };

  const handlePrimarySelect = (value: string) => {
    setSelectedColor(value);
    setSelectedSize(null);
    setQuantity(1);
  };

  const handleSecondarySelect = (value: string) => {
    setSelectedSize(value);
  };

  const handleLocalOrder = async () => {
    if (!customerName || !customerPhone) { alert('Name and phone are required'); return; }
    if (!selectedVariant) { alert('Please select a product'); return; }
    setSubmitting(true);
    try {
      const { default: api } = await import('@/lib/api');
      const res = await api.post('/public/order', {
        slug: page?.slug,
        variantId: selectedVariant.id,
        quantity,
        customerName, customerPhone,
        customerEmail: customerEmail || undefined,
        customerAddress: customerAddress || undefined,
      });
      if (res.data.success) {
        alert('Order placed successfully!');
        setQuantity(1);
        setCustomerName(''); setCustomerPhone(''); setCustomerEmail(''); setCustomerAddress('');
        setSelectedColor(null);
        setSelectedSize(null);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to place order');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-700 text-white py-2 px-4 text-center text-xs font-medium">
        <FiPhone className="inline mr-1" /> {tenant?.phone || displayPhone || 'Contact us'} | Free Shipping on all orders
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-8xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {displayLogo && <img src={displayLogo} className="h-10 w-10 rounded-sm object-cover" />}
            <div>
              <h1 className="text-lg font-bold text-gray-900">{page?.title || companyName || 'Fashion Store'}</h1>
              <p className="text-xs text-gray-400">Fashion Store</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#order" className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-5 py-2 rounded-sm text-sm font-semibold shadow-lg shadow-pink-200 hover:shadow-xl transition-all">
              <FiShoppingCart className="w-4 h-4" /> Shop Now
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-pink-50 via-rose-50 to-white overflow-hidden">
        <div className="max-w-8xl mx-auto px-4 py-8 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-block bg-pink-100 text-pink-700 text-xs px-3 py-1 rounded-sm font-semibold mb-3">New Collection</div>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                {product?.name || companyName || 'Fashion Collection'}
              </h2>
              <p className="text-gray-500 text-lg mb-6">{product?.description || 'Stay stylish with our latest collection'}</p>
              {selectedVariant && (
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold text-pink-600">৳{selectedVariant.price.toFixed(2)}</span>
                  {selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
                    <span className="text-lg text-gray-400 line-through">৳{selectedVariant.compareAtPrice.toFixed(2)}</span>
                  )}
                </div>
              )}
              <a href="#order" className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-8 py-3.5 rounded-sm font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                <FiShoppingCart className="w-5 h-5" /> Order Now
              </a>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="aspect-[3/4] rounded-sm overflow-hidden shadow-2xl bg-gradient-to-br from-pink-100 to-rose-100">
                {displayImages[selectedImage] ? (
                  <img src={displayImages[selectedImage]} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-pink-200 text-6xl"><FiHeart /></div>
                )}
              </div>
              {displayImages.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {displayImages.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 rounded-sm overflow-hidden border-2 flex-shrink-0 ${selectedImage === i ? 'border-pink-500' : 'border-gray-200'}`}>
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Variant Selection */}
      <section className="max-w-8xl mx-auto px-4 py-8">

        {/* ─── IF only one variant, just show it — no selector needed ─── */}
        {variants.length === 1 && selectedVariant && (
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-sm p-5 border border-pink-100 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-sm overflow-hidden bg-white border border-pink-200 flex-shrink-0">
                {selectedVariant.image ? (
                  <img src={selectedVariant.image} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-pink-300 text-2xl"><FiHeart /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{product?.name}</p>
                <p className="text-sm text-gray-500">{Object.values(selectedVariant.attributes || {}).join(' / ')}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold text-pink-600">৳{selectedVariant.price.toFixed(2)}</span>
                  {selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
                    <span className="text-sm text-gray-400 line-through">৳{selectedVariant.compareAtPrice.toFixed(2)}</span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <a href="#order" className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-4 py-2 rounded-sm text-sm font-bold shadow-md hover:shadow-lg transition-all">
                  <FiShoppingCart className="w-4 h-4" /> Order Now
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ─── PRIMARY ATTRIBUTE SELECTOR (e.g. Color) ─── */}
        {variants.length > 1 && primaryAttrKey && primaryValues.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-sm bg-pink-100 flex items-center justify-center">
                <span className="text-pink-600 font-bold text-sm">1</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {selectedColor
                  ? `Selected ${primaryAttrKey}: ${selectedColor}`
                  : `Choose ${primaryAttrKey}`}
              </h3>
              {selectedColor && (
                <button onClick={() => { setSelectedColor(null); setSelectedSize(null); }}
                  className="text-xs text-pink-500 hover:text-pink-700 font-medium ml-auto">
                  Change
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {primaryValues.map((value, i) => {
                const isColorType = primaryAttrKey.toLowerCase() === 'color';
                const hex = isColorType ? getColorHex(value) : '#ec4899';
                const isLight = isColorType ? isLightColor(hex) : false;
                const isSelected = selectedColor === value;
                return (
                  <button
                    key={i}
                    onClick={() => handlePrimarySelect(value)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-sm font-semibold text-sm border-2 transition-all
                      ${isSelected
                        ? 'border-pink-500 ring-2 ring-pink-200 bg-pink-50'
                        : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md'
                      }
                    `}
                  >
                    {isColorType && (
                      <span
                        className="w-7 h-7 rounded-sm border border-gray-300 flex-shrink-0"
                        style={{
                          backgroundColor: hex,
                          ...(isLight && { boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' })
                        }}
                      />
                    )}
                    <span className={isSelected ? 'text-pink-700' : 'text-gray-700'}>{value}</span>
                    {isSelected && <FiCheck className="text-pink-500 w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── SECONDARY ATTRIBUTE SELECTOR (e.g. Size) ─── */}
        {/* Shows when: primary selected && secondary attr exists */}
        {variants.length > 1 && secondaryAttrKey && selectedColor && filteredSecondaryValues.length > 0 && (
          <div className="mb-8" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-sm bg-pink-100 flex items-center justify-center">
                <span className="text-pink-600 font-bold text-sm">2</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {selectedSize
                  ? `Selected ${secondaryAttrKey}: ${selectedSize}`
                  : `Choose ${secondaryAttrKey}`}
              </h3>
              {selectedSize && (
                <button onClick={() => { setSelectedSize(null); }}
                  className="text-xs text-pink-500 hover:text-pink-700 font-medium ml-auto">
                  Change
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {filteredSecondaryValues.map((value, i) => {
                const isSelected = selectedSize === value;
                const stockInfo = variants.find(v => {
                  const vPrim = v.attributes?.[primaryAttrKey!];
                  const vSec = v.attributes?.[secondaryAttrKey!];
                  return vPrim === selectedColor && vSec === value;
                });
                const outOfStock = stockInfo && stockInfo.stock <= 0;
                return (
                  <button
                    key={i}
                    onClick={() => !outOfStock && handleSecondarySelect(value)}
                    disabled={outOfStock}
                    className={`
                      px-6 py-3 rounded-sm text-sm font-bold border-2 transition-all
                      ${isSelected
                        ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-200'
                        : outOfStock
                          ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:shadow-md'
                      }
                    `}
                  >
                    {value}
                    {outOfStock && <span className="text-[10px] block text-gray-400">Out of stock</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── SHOW SIZE DIRECTLY IF NO COLOR ATTRIBUTE ─── */}
        {variants.length > 1 && !primaryAttrKey && secondaryAttrKey && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-sm bg-pink-100 flex items-center justify-center">
                <span className="text-pink-600 font-bold text-sm">1</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {selectedSize
                  ? `Selected ${secondaryAttrKey}: ${selectedSize}`
                  : `Choose ${secondaryAttrKey}`}
              </h3>
              {selectedSize && (
                <button onClick={() => { setSelectedSize(null); }}
                  className="text-xs text-pink-500 hover:text-pink-700 font-medium ml-auto">
                  Change
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {secondaryValues.map((value, i) => {
                const isSelected = selectedSize === value;
                const stockInfo = variants.find(v => v.attributes?.[secondaryAttrKey!] === value);
                const outOfStock = stockInfo && stockInfo.stock <= 0;
                return (
                  <button
                    key={i}
                    onClick={() => !outOfStock && handleSecondarySelect(value)}
                    disabled={outOfStock}
                    className={`
                      px-6 py-3 rounded-sm text-sm font-bold border-2 transition-all
                      ${isSelected
                        ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-200'
                        : outOfStock
                          ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:shadow-md'
                      }
                    `}
                  >
                    {value}
                    {outOfStock && <span className="text-[10px] block text-gray-400">Out of stock</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── AUTO-SELECT when only one secondary value available ─── */}
        {variants.length > 1 && secondaryAttrKey && selectedColor && filteredSecondaryValues.length === 1 && !selectedSize && (
          <div className="text-sm text-pink-600 font-medium mb-4" style={{ animation: 'fadeIn 0.3s ease' }}>
            <FiCheck className="inline mr-1" /> Only {filteredSecondaryValues[0]} available in {selectedColor}
            <button
              onClick={() => handleSecondarySelect(filteredSecondaryValues[0])}
              className="ml-2 underline hover:text-pink-800"
            >
              Select {filteredSecondaryValues[0]}
            </button>
          </div>
        )}

        {/* ─── SELECTED VARIANT PREVIEW ─── */}
        {selectedVariant && variants.length > 1 && (
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-sm p-5 border border-pink-100 mb-6" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-sm overflow-hidden bg-white border border-pink-200 flex-shrink-0">
                {selectedVariant.image ? (
                  <img src={selectedVariant.image} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-pink-300 text-2xl"><FiHeart /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{product?.name}</p>
                <p className="text-sm text-gray-500">{Object.values(selectedVariant.attributes || {}).join(' / ')}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold text-pink-600">৳{selectedVariant.price.toFixed(2)}</span>
                  {selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
                    <span className="text-sm text-gray-400 line-through">৳{selectedVariant.compareAtPrice.toFixed(2)}</span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <a href="#order" className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-4 py-2 rounded-sm text-sm font-bold shadow-md hover:shadow-lg transition-all">
                  <FiShoppingCart className="w-4 h-4" /> Order Now
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ─── VARIANT CARDS GRID (only when primary selected but secondary not yet) ─── */}
        {variants.length > 1 && primaryAttrKey && selectedColor && !selectedSize && filteredSecondaryValues.length > 1 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Available Options in {selectedColor}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {variants
                .filter(v => v.attributes?.[primaryAttrKey!] === selectedColor)
                .map((variant) => {
                  const secVal = variant.attributes?.[secondaryAttrKey!] || 'Standard';
                  const isCardSelected = selectedSize === secVal;
                  const outOfStock = variant.stock <= 0;
                  return (
                    <div
                      key={variant.id}
                      onClick={() => !outOfStock && handleSecondarySelect(secVal)}
                      className={`
                        bg-white rounded-sm border-2 overflow-hidden cursor-pointer transition-all
                        ${isCardSelected
                          ? 'border-pink-500 shadow-lg shadow-pink-100'
                          : outOfStock
                            ? 'border-gray-100 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
                        }
                      `}
                    >
                      <div className="aspect-square bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center p-3">
                        {variant.image ? (
                          <img src={variant.image} className="w-full h-full object-contain" />
                        ) : (
                          <div className="text-pink-200 text-3xl"><FiHeart /></div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-bold text-gray-900 text-sm truncate">{secVal}</p>
                        <p className="text-pink-600 font-bold text-base mt-0.5">৳{variant.price.toFixed(2)}</p>
                        {outOfStock ? (
                          <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                        ) : (
                          <span className="text-xs text-red-600 font-medium">
                            {variant.stock > 10 ? 'In Stock' : `Only ${variant.stock} left`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ─── DROPDOWN FALLBACK ─── */}
        {variants.length > 1 && !primaryAttrKey && !secondaryAttrKey && (
          <div className="mt-6">
            <label className="text-sm font-bold text-gray-900 mb-2 block">Select variant:</label>
            <select value={selectedVariant?.id || ''} onChange={(e) => {
              const v = variants.find(v => v.id === e.target.value) || null;
              if (v) setSelectedVariant(v);
            }}
              className="w-full md:w-64 px-4 py-3 border border-gray-200 rounded-sm outline-none text-sm">
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {Object.values(v.attributes).join(' / ')} - ৳{v.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ─── DIRECT VARIANT SELECTION WHEN NO KNOWN ATTRS ─── */}
        {variants.length > 1 && allAttrKeys.length > 0 && !primaryAttrKey && !secondaryAttrKey && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
            {variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              const outOfStock = variant.stock <= 0;
              return (
                <div
                  key={variant.id}
                  onClick={() => { if (!outOfStock) { setSelectedVariant(variant); setQuantity(1); }}}
                  className={`
                    bg-white rounded-sm border-2 overflow-hidden cursor-pointer transition-all
                    ${isSelected
                      ? 'border-pink-500 shadow-lg shadow-pink-100'
                      : outOfStock
                        ? 'border-gray-100 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
                    }
                  `}
                >
                  <div className="aspect-square bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center p-3">
                    {variant.image ? (
                      <img src={variant.image} className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-pink-200 text-3xl"><FiHeart /></div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-gray-900 text-sm truncate">{Object.values(variant.attributes).join(' / ') || variant.sku}</p>
                    <p className="text-pink-600 font-bold text-base mt-0.5">৳{variant.price.toFixed(2)}</p>
                    {outOfStock ? (
                      <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                    ) : (
                      <span className="text-xs text-red-600 font-medium">
                        {variant.stock > 10 ? 'In Stock' : `Only ${variant.stock} left`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── FALLBACK dropdown for when color exists but no size ─── */}
        {variants.length > 1 && primaryAttrKey && selectedColor && !secondaryAttrKey && !selectedSize && (
          <div className="mt-4">
            <label className="text-sm font-bold text-gray-900 mb-2 block">Select variant in {selectedColor}:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {variants.filter(v => v.attributes?.[primaryAttrKey!] === selectedColor).map((variant) => {
                const isSelected = selectedVariant?.id === variant.id;
                const outOfStock = variant.stock <= 0;
                return (
                  <div
                    key={variant.id}
                    onClick={() => { if (!outOfStock) { setSelectedVariant(variant); setQuantity(1); }}}
                    className={`
                      bg-white rounded-sm border-2 overflow-hidden cursor-pointer transition-all
                      ${isSelected
                        ? 'border-pink-500 shadow-lg shadow-pink-100'
                        : outOfStock
                          ? 'border-gray-100 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
                    }`}
                  >
                    <div className="aspect-square bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center p-3">
                      {variant.image ? (
                        <img src={variant.image} className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-pink-200 text-3xl"><FiHeart /></div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-gray-900 text-sm truncate">{Object.values(variant.attributes).filter(a => a !== selectedColor).join(' / ') || variant.sku}</p>
                      <p className="text-pink-600 font-bold text-base mt-0.5">৳{variant.price.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Order Form */}
      <section id="order" className="bg-gradient-to-b from-white to-pink-50 py-12">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-sm shadow-xl p-6 md:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Place Your Order</h2>
            <p className="text-gray-500 mb-6 text-sm">Fill in your details and we will confirm your order</p>

            {selectedVariant && (
              <div className="bg-pink-50 border border-pink-200 rounded-sm p-3 mb-4">
                <div className="flex items-center gap-3">
                  {selectedVariant.image && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-pink-100 flex-shrink-0">
                      <img src={selectedVariant.image} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{product?.name}</p>
                    <p className="text-xs text-gray-500">{Object.values(selectedVariant.attributes || {}).join(' / ')}</p>
                    <p className="text-sm font-bold text-pink-600 mt-1">৳{selectedVariant.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-sm border border-gray-200 flex items-center justify-center hover:bg-pink-50 font-bold">-</button>
                <span className="text-xl font-bold w-10 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-sm border border-gray-200 flex items-center justify-center hover:bg-pink-50 font-bold">+</button>
              </div>
            </div>

            <div className="space-y-3">
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-sm outline-none" placeholder="Your Name *" />
              <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-sm outline-none" placeholder="Phone Number *" />
              <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-sm outline-none" placeholder="Email (optional)" />
              <textarea value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-sm outline-none" placeholder="Delivery Address" rows={2} />
            </div>

            <button onClick={handleLocalOrder} disabled={submitting || !selectedVariant}
              className="w-full mt-6 bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3.5 rounded-sm font-bold text-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              <FiShoppingCart className="w-5 h-5" />
              {submitting ? 'Processing...' : `Order Now - ৳${((selectedVariant?.price || 0) * quantity).toFixed(2)}`}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-pink-800 to-rose-900 text-white py-8">
        <div className="max-w-8xl mx-auto px-4 text-center">
          <p className="font-bold text-lg">{companyName}</p>
          <p className="text-sm text-pink-200 mt-1">{displayPhone} {displayPhone2 ? `| ${displayPhone2}` : ''}</p>
          {displayAddress && <p className="text-sm text-pink-200 mt-1">{displayAddress}</p>}
          <div className="border-t border-pink-700/50 mt-4 pt-4 text-xs text-pink-300">
            &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}