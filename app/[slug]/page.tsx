"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useThrottledCounter } from "@/lib/performance";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import Fuse from "fuse.js";
import {
  FaWhatsapp,
  FaPhoneAlt,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaEnvelope,
  FaHeadset,
  FaShieldAlt,
  FaTruck,
  FaStar,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaLeaf,
  FaUndo,
  FaMoneyBillWave,
  FaFire,
  FaLock,
  FaAward,
  FaHeart,
  FaSearch,
  FaUser,
  FaAngleRight,
  FaPlus,
  FaMinus,
  FaTag,
  FaBolt,
  FaTimes,
  FaBars,
  FaTrash,
  FaShoppingBag,
  FaTimes as FaTimesIcon,
} from "react-icons/fa";
import api from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Product, Variant, Tenant, LandingPage, Review } from "@/types";
import LoadingButton from "@/components/loading/LoadingButton";
import { Skeleton, SkeletonText, SkeletonCard } from "@/components/loading";
import { ThemeConfig, themeConfigs } from "./themeConfig";
import { toPublicVariant, type PublicProduct } from "@/lib/variants";
import {
  buildMetaServerEventPayload,
  createMetaEventId,
  initializeMetaPixel,
  readMetaCookies,
  shouldInitializeMetaPixel,
  shouldSendMetaServerEvent,
  trackMetaPixelEvent,
} from "@/lib/metaTracking";
import type { MetaEventItem, MetaPixelConfig } from "@/lib/metaTracking";

interface PublicPageData {
  page: LandingPage;
  product: Product;
  products?: Product[];
  tenant: Tenant;
  categories?: any[];
  brands?: any[];
  banners?: BannerItem[];
}
type OrderFormData = {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail: string;
  notes: string;
  couponCode?: string;
  paymentMethod?: string;
};

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function AnimSection({
  children,
  className = "",
  delay = 0,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      id={id}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function SidebarMenu({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-1 border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white transition-colors group rounded-sm"
      >
        <span className="text-sm font-black text-gray-800 group-hover:text-red-600 transition-colors">
          {title}
        </span>
        <FaChevronDown
          className={`text-gray-400 text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

import Navbar from "@/components/landing/page/Navbar";
import MobileSidebar from "@/components/landing/page/MobileSidebar";
import DesktopSidebar from "@/components/landing/page/DesktopSidebar";
import HeroSection from "@/components/landing/page/HeroSection";
import VariantsGrid from "@/components/landing/page/VariantsGrid";
import OrderForm from "@/components/landing/page/OrderForm";
import ReviewsSection from "@/components/landing/page/ReviewsSection";
import FAQSection from "@/components/landing/page/FAQSection";
import ContactSection from "@/components/landing/page/ContactSection";
import StoreFooter from "@/components/landing/page/StoreFooter";
import Header from "@/components/landing/page/Header";
import HeroBanner from "@/components/landing/page/HeroBanner";
import CategoryTiles from "@/components/landing/page/CategoryTiles";
import WishlistDrawer from "@/components/landing/page/WishlistDrawer";
import CartDrawer from "@/components/landing/page/CartDrawer";
import BestProductsSection from "@/components/landing/page/BestProductsSection";
import PreOrderSection from "@/components/landing/page/PreOrderSection";
import CategoryNavStrip from "@/components/landing/page/CategoryNavStrip";
import { FiPackage, FiShoppingCart, FiTag, FiX } from "react-icons/fi";

// ===== নতুন BannerSlider কম্পোনেন্ট =====
interface BannerItem {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  linkUrl?: string;
}

export default function PublicLandingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeSlug = typeof params.slug === "string" ? params.slug : "";
  const [data, setData] = useState<PublicPageData | null>(null);
  const [metaConfigState, setMetaConfigState] = useState<{
    slug: string;
    config: MetaPixelConfig | null;
  } | null>(null);
  const [marketingConsentState, setMarketingConsentState] = useState<{
    slug: string;
    consent: boolean | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [cartCount, setCartCount] = useState(0);

  const [quantity, setQuantity] = useState(1);
  const QUANTITY_STEP = 1;
  const roundToStep = (val: number) => Math.round(val);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderNumber: string;
  } | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [currentTheme] = useState<string>("original");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [activeGallery, setActiveGallery] = useState(0);
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const [selectedVariantAttrs, setSelectedVariantAttrs] = useState<{
    [key: string]: string;

  }>({});
  const cameFromListRef = useRef(false);

  // Reset gallery when variant or color changes
  useEffect(() => {
    setActiveGallery(0);
  }, [selectedVariant?.id, currentColor]);

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewName, setReviewName] = useState("");
  const [reviewLocation, setReviewLocation] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewPhone, setReviewPhone] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // Optimized: stock timer uses ref for 1s ticks, only triggers re-render every 10s
  const stockTimerRef = useRef({ h: 2, m: 47, s: 33 });
  const [stockTimerDisplay, setStockTimerDisplay] = useState(stockTimerRef.current);
  const [bdTimeDisplay, setBdTimeDisplay] = useState(new Date());
  const stockTimer = stockTimerDisplay;
  const bdTime = bdTimeDisplay;

  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [wishlistData, setWishlistData] = useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartData, setCartData] = useState<any>(null);
  const [cartLoadingItems, setCartLoadingItems] = useState<Set<string>>(
    new Set(),
  );

  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(
    null,
  );
  const [expandedSubcategoryId, setExpandedSubcategoryId] = useState<
    string | null
  >(null);
  const [expandedBrandId, setExpandedBrandId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("default");
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [isCartOrder, setIsCartOrder] = useState(false);
  const [selectedCartItems, setSelectedCartItems] = useState<Set<string>>(
    new Set(),
  );
  const [cartItemVariants, setCartItemVariants] = useState<{
    [key: string]: any[];
  }>({});
  const [selectedItemAttrs, setSelectedItemAttrs] = useState<{
    [key: string]: { [key: string]: string };
  }>({});
  const [cartOrderProcessing, setCartOrderProcessing] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const addToCartInFlightRef = useRef(new Set<string>());
  const orderSubmissionInFlightRef = useRef(false);
  const cartOrderSubmissionInFlightRef = useRef(false);
  const checkoutInitiatedRef = useRef(false);
  const viewedProductIdRef = useRef<string | null>(null);

  const metaConfig =
    metaConfigState?.slug === storeSlug ? metaConfigState.config : null;
  const marketingConsent =
    marketingConsentState?.slug === storeSlug
      ? marketingConsentState.consent
      : null;

  useEffect(() => {
    if (!storeSlug) return;
    addToCartInFlightRef.current.clear();
    orderSubmissionInFlightRef.current = false;
    cartOrderSubmissionInFlightRef.current = false;
    checkoutInitiatedRef.current = false;
    viewedProductIdRef.current = null;
    let consent: boolean | null = null;
    try {
      const saved = localStorage.getItem(`marketing-consent:${storeSlug}`);
      if (saved === "granted") consent = true;
      else if (saved === "denied") consent = false;
    } catch {
      // Consent remains unset when browser storage is unavailable.
    }
    const timer = window.setTimeout(
      () => setMarketingConsentState({ slug: storeSlug, consent }),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [storeSlug]);

  useEffect(() => {
    if (
      marketingConsent !== true ||
      !shouldInitializeMetaPixel(metaConfig, true) ||
      !metaConfig.pixelId
    ) {
      return;
    }
    initializeMetaPixel(metaConfig.pixelId);
  }, [marketingConsent, metaConfig]);

  const trackMetaEvent = useCallback(
    (
      eventName: "ViewContent" | "AddToCart" | "InitiateCheckout",
      items: MetaEventItem[],
    ) => {
      if (
        marketingConsent !== true ||
        !shouldInitializeMetaPixel(metaConfig, true) ||
        !metaConfig.pixelId ||
        items.length === 0
      ) {
        return;
      }

      const eventId = createMetaEventId();
      initializeMetaPixel(metaConfig.pixelId);
      const contentItems = items.map(({ productId, quantity }) => ({
        id: productId,
        quantity,
      }));
      trackMetaPixelEvent(
        metaConfig.pixelId,
        eventName,
        {
          content_ids: [...new Set(items.map((item) => item.productId))],
          content_type: "product",
          contents: contentItems,
        },
        eventId,
      );

      if (shouldSendMetaServerEvent(metaConfig, true)) {
        const payload = buildMetaServerEventPayload({
          tenantSlug: storeSlug,
          eventName,
          eventId,
          eventSourceUrl: window.location.href,
          items,
          cookies: readMetaCookies(document.cookie),
        });
        void api
          .post("/marketing/meta/events", payload)
          .catch(() => console.warn("Meta server event failed; storefront flow continues."));
      }
      return eventId;
    },
    [marketingConsent, metaConfig, storeSlug],
  );

  const trackPurchase = useCallback(
    (orderId: string) => {
      if (
        marketingConsent !== true ||
        !shouldInitializeMetaPixel(metaConfig, true) ||
        !metaConfig.pixelId
      ) {
        return;
      }
      initializeMetaPixel(metaConfig.pixelId);
      trackMetaPixelEvent(metaConfig.pixelId, "Purchase", {}, orderId);
    },
    [marketingConsent, metaConfig],
  );

  const initiateCheckout = useCallback(
    (items: MetaEventItem[]) => {
      if (checkoutInitiatedRef.current) return;
      const validItems = items.filter(
        (item) => item.productId && Number.isFinite(item.quantity) && item.quantity > 0,
      );
      if (validItems.length === 0) return;
      checkoutInitiatedRef.current = true;
      trackMetaEvent("InitiateCheckout", validItems);
    },
    [trackMetaEvent],
  );

  const getOrderMarketingFields = () => {
    if (marketingConsent !== true) return { marketingConsent: false };
    return {
      marketingConsent: true,
      eventSourceUrl: window.location.href,
      ...readMetaCookies(document.cookie),
    };
  };

  const saveMarketingConsent = (consent: boolean) => {
    try {
      localStorage.setItem(
        `marketing-consent:${storeSlug}`,
        consent ? "granted" : "denied",
      );
    } catch {
      // Keep the choice for this page session when browser storage is unavailable.
    }
    setMarketingConsentState({ slug: storeSlug, consent });
  };

  // Auto-save incomplete checkout data
  const saveIncompleteFormData = useCallback(async (formData: Partial<OrderFormData>) => {
    if (!data?.tenant?.id || !sessionId) return;
    try {
      setAutoSaveStatus('saving');
      await api.post('/public/incomplete-checkout/save', {
        sessionId,
        tenantId: data.tenant.id,
        customerName: formData.customerName || undefined,
        customerPhone: formData.customerPhone || undefined,
        customerEmail: formData.customerEmail || undefined,
        customerAddress: formData.customerAddress || undefined,
        notes: formData.notes || undefined,
        variantId: selectedVariant?.id || undefined,
        quantity: quantity || undefined,
        cartSessionId: isCartOrder ? sessionId : undefined,
      });
      setAutoSaveStatus('saved');
    } catch {
      // Silent fail - auto-save should not disrupt user
    } finally {
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }
  }, [data?.tenant?.id, sessionId, selectedVariant?.id, quantity, isCartOrder]);

  // Auto-save form data periodically while form fields exist
  // Uses an interval to check form field values every 15 seconds (reduced from 3s for performance)
  useEffect(() => {
    if (!data?.tenant?.id || !sessionId) return;
    
    // Debounce - don't fire immediately
    const interval = setInterval(() => {
      // Only save if the order form section is visible
      const orderForm = document.getElementById('order-form');
      if (!orderForm) return;
      
      const nameInput = document.querySelector('input[name="customerName"]') as HTMLInputElement;
      const phoneInput = document.querySelector('input[name="customerPhone"]') as HTMLInputElement;
      const emailInput = document.querySelector('input[name="customerEmail"]') as HTMLInputElement;
      const addressInput = document.querySelector('textarea[name="customerAddress"]') as HTMLTextAreaElement;
      const notesInput = document.querySelector('textarea[name="notes"]') as HTMLTextAreaElement;
      
      // Only save if at least one input exists on the page
      if (!nameInput && !phoneInput) return;
      
      const formData = {
        customerName: nameInput?.value?.trim() || '',
        customerPhone: phoneInput?.value?.trim() || '',
        customerEmail: emailInput?.value?.trim() || '',
        customerAddress: addressInput?.value?.trim() || '',
        notes: notesInput?.value?.trim() || '',
      };
      
      const hasData = Object.values(formData).some(v => v.length > 0);
      if (hasData) {
        saveIncompleteFormData(formData);
      }
    }, 15000); // Check every 15 seconds (reduced from 3s for performance)

    return () => clearInterval(interval);
  }, [data?.tenant?.id, sessionId, saveIncompleteFormData]);

  // Build productId -> variants map for cart items attribute selection
  useEffect(() => {
    const sourceProducts = data?.products && data.products.length ? data.products : data?.product ? [data.product] : [];
    const allV: Variant[] = sourceProducts.flatMap((p: Product) =>
      Array.isArray(p.variants) ? (p.variants as Variant[]) : [],
    );
    if (!allV.length) {
      setCartItemVariants({});
      return;
    }
    const map: { [key: string]: Variant[] } = {};
    allV.forEach((v) => {
      const pid = (v as Variant & { productId?: string }).productId;
      if (!pid) return;
      if (!map[pid]) map[pid] = [];
      map[pid].push(v);
    });
    setCartItemVariants(map);
  }, [data]);

  // Initialize selectedItemAttrs from current cart items
  useEffect(() => {
    if (!cartData?.items?.length) {
      setSelectedItemAttrs({});
      return;
    }
    const init: { [key: string]: { [key: string]: string } } = {};
    cartData.items.forEach((item: any) => {
      const iid = item.id;
      if (init[iid]) return;
      const v = item.variant;
      if (!v?.attributes) {
        init[iid] = {};
        return;
      }
      const attrs: { [key: string]: string } = {};
      Object.entries(v.attributes).forEach(([k, val]: [string, any]) => {
        if (Array.isArray(val)) attrs[k] = val[0];
        else if (typeof val === "string" && val.startsWith("[")) {
          try {
            const p = JSON.parse(val);
            attrs[k] = Array.isArray(p) ? p[0] : val;
          } catch {
            attrs[k] = val;
          }
        } else attrs[k] = val;
      });
      init[iid] = attrs;
    });
    setSelectedItemAttrs(init);
  }, [cartData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrderFormData>({
    defaultValues: { paymentMethod: "CASH_ON_DELIVERY" },
  });

  const debouncedSearch = useDebounce(searchQuery, 300);

  const allProducts: Product[] = useMemo(() => {
    const products = data?.products && data.products.length ? data.products : data?.product ? [data.product] : [];
    return products;
  }, [data]);

  const preOrderProducts: Product[] = useMemo(() => {
    return (allProducts || []).filter((p) => Array.isArray(p.variants) && p.variants.length > 0 && p.variants.some((v: Variant) => v.isPreOrder || (v as any).preOrderPrice != null));
  }, [allProducts]);

  const variants: Variant[] = useMemo(
    () => allProducts.flatMap((p) => (Array.isArray(p.variants) ? p.variants : [])),
    [allProducts],
  );

  const variantProductMap: { [key: string]: Product } = useMemo(() => {
    const map: { [key: string]: Product } = {};
    allProducts.forEach((p) => (p.variants || []).forEach((v) => { map[v.id] = p; }));
    return map;
  }, [allProducts]);

  const viewMode: "home" | "detail" = useMemo(() => {
    const vId = searchParams.get("variant");
    if (!vId) return "home";
    if (variants.length === 0) return "detail";
    return variants.some((v) => v.id === vId) ? "detail" : "home";
  }, [searchParams, variants]);

  useEffect(() => {
    const vId = searchParams.get("variant");
    if (!vId || !data || variants.length === 0) return;
    if (!variants.some((v) => v.id === vId)) {
      const sp = new URLSearchParams(searchParams.toString());
      sp.delete("variant");
      router.replace(sp.toString() ? `/${storeSlug}?${sp.toString()}` : `/${storeSlug}`, { scroll: false });
    }
  }, [data, variants, searchParams, router, storeSlug]);

  const getProductForVariant = useCallback(
    (variantId: string): Product | null => {
      if (variantProductMap[variantId]) return variantProductMap[variantId];
      if (!data) return null;
      const allProds = data.products || [];
      for (const prod of allProds) {
        if (prod.variants?.some((v: Variant) => v.id === variantId)) return prod;
      }
      if (data.product?.variants?.some((v: Variant) => v.id === variantId))
        return data.product;
      return null;
    },
    [data, variantProductMap],
  );

  const getProductMinInStockPrice = useCallback((p: Product): number => {
    const vs = Array.isArray(p.variants) ? p.variants : [];
    const inStock = vs.filter((v) => (v.stock ?? 0) > 0);
    const pool = inStock.length ? inStock : vs;
    if (!pool.length) return Number.MAX_SAFE_INTEGER;
    return Math.min(...pool.map((v) => Number(v.price) || 0));
  }, []);

  const fuse = useMemo(() => {
    if (!allProducts.length) return null;
    return new Fuse(allProducts, {
      keys: ["name", "slug"],
      threshold: 0.35,
      includeScore: true,
    });
  }, [allProducts]);

  const filteredProducts: Product[] = useMemo(() => {
    let results = [...allProducts];
    const hasVariants = (p: Product) => Array.isArray(p.variants) && p.variants.length > 0;
    results = results.filter(hasVariants);
    if (debouncedSearch.trim() && fuse) {
      results = fuse.search(debouncedSearch).map((r) => r.item).filter(hasVariants);
    }
    if (selectedCategory) {
      const allCats = (data?.categories || []) as Array<{ id: string; name: string; subcategories?: Array<{ id: string; name: string }> }>;
      const selectedCat = allCats.find((c) => c.id === selectedCategory || c.name === selectedCategory);
      const childIds = new Set<string>((selectedCat?.subcategories || []).map((sc) => sc.id));
      const childNames = new Set<string>((selectedCat?.subcategories || []).map((sc) => sc.name));
      results = results.filter((p) =>
        (p.categories || []).some((pc) => {
          const c = pc as { id?: string; name?: string; category?: { id?: string; name?: string } };
          const cid = c.id || c.category?.id || "";
          const cname = c.name || c.category?.name || "";
          return (
            cid === selectedCategory ||
            cname === selectedCategory ||
            (selectedCat && (cid === selectedCat.id || cname === selectedCat.name)) ||
            childIds.has(cid) ||
            childNames.has(cname)
          );
        }),
      );
    }
    if (selectedSubcategory) {
      results = results.filter((p) =>
        (p.categories || []).some((pc) => {
          const c = pc as { id?: string; name?: string; category?: { id?: string; name?: string } };
          const cid = c.id || c.category?.id || "";
          const cname = c.name || c.category?.name || "";
          return cid === selectedSubcategory || cname === selectedSubcategory;
        }),
      );
    }
    if (selectedBrand) {
      results = results.filter((p) => p.brand?.id === selectedBrand);
    }
    const min = priceMin ? parseFloat(priceMin) : NaN;
    const max = priceMax ? parseFloat(priceMax) : NaN;
    if (!Number.isNaN(min)) results = results.filter((p) => getProductMinInStockPrice(p) >= min);
    if (!Number.isNaN(max)) results = results.filter((p) => getProductMinInStockPrice(p) <= max);
    if (sortBy === "price_asc") results.sort((a, b) => getProductMinInStockPrice(a) - getProductMinInStockPrice(b));
    else if (sortBy === "price_desc") results.sort((a, b) => getProductMinInStockPrice(b) - getProductMinInStockPrice(a));
    else if (sortBy === "oldest") results.sort((a, b) => (a.id > b.id ? 1 : -1));
    else if (sortBy === "newest") results.sort((a, b) => (a.id < b.id ? 1 : -1));
    return results;
  }, [
    allProducts,
    debouncedSearch,
    fuse,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    sortBy,
    priceMin,
    priceMax,
    data,
    getProductMinInStockPrice,
  ]);

  const filteredVariants: Variant[] = useMemo(
    () => filteredProducts.flatMap((p) => (Array.isArray(p.variants) ? p.variants : [])),
    [filteredProducts],
  );

  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || !fuse) return [] as Variant[];
    const prods = fuse.search(searchQuery).slice(0, 5).map((r) => r.item);
    return prods
      .map((p) => {
        const vs = (p.variants || []).filter((v) => (v.stock ?? 0) > 0);
        return vs[0] || p.variants?.[0];
      })
      .filter((v): v is Variant => Boolean(v));
  }, [searchQuery, fuse]);

  const clearFilters = () => {
    setSearchQuery("");
    setPriceMin("");
    setPriceMax("");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedBrand(null);
    setSortBy("default");
    setShowSuggestions(false);
  };

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (priceMin || priceMax ? 1 : 0) +
    (selectedCategory ? 1 : 0) +
    (selectedSubcategory ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (sortBy !== "default" ? 1 : 0);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let sid = localStorage.getItem("guest_session_id");
    if (!sid) {
      sid =
        "sess_" +
        Date.now().toString(36) +
        "_" +
        Math.random().toString(36).substring(2, 9);
      localStorage.setItem("guest_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  // ========== CART FUNCTIONS ==========
  const fetchCartData = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await api.get(`/public/cart?sessionId=${sessionId}`);
      if (res.data.success && res.data.data?.items) {
        setCartData(res.data.data);
        setCartCount(res.data.data.items.length);
        if (isCartOrder) {
          const allVariantIds: string[] = (
            res.data.data.items
              .map((item: any) => item.variant?.id)
              .filter(Boolean)
          );
          const allVariantSet = new Set(allVariantIds);
          setSelectedCartItems((prev) => {
            const newSet = new Set(prev);
            for (const id of newSet)
              if (!allVariantSet.has(id)) newSet.delete(id);
            for (const id of allVariantSet) if (!newSet.has(id)) newSet.add(id);
            return newSet;
          });
        }
      } else {
        setCartCount(0);
        setCartData(null);
        if (isCartOrder) setIsCartOrder(false);
      }
    } catch {
      setCartCount(0);
    }
  }, [sessionId, isCartOrder]);

  useEffect(() => {
    if (sessionId) fetchCartData();
  }, [sessionId, fetchCartData]);

  const addToCart = async (
    variantId: string,
    qty: number = 1,
    attributes: Record<string, string> = selectedVariantAttrs,
  ) => {
    if (!sessionId) {
      showToast.error("Session not ready");
      return;
    }
    if (addToCartInFlightRef.current.has(variantId)) return;
    addToCartInFlightRef.current.add(variantId);
    setCartLoadingItems((prev) => new Set(prev).add(variantId));
    try {
      const res = await api.post("/public/cart/add", {
        variantId,
        attributes,
        price: variants.find((variant) => variant.id === variantId)?.price,
        quantity: qty,
        sessionId,
      });
      if (res.data.success) {
        showToast.success("কার্টে যোগ করা হয়েছে!");
        const productId =
          variantProductMap[variantId]?.id ||
          variants.find((variant) => variant.id === variantId)?.productId;
        if (productId) trackMetaEvent("AddToCart", [{ productId, quantity: qty }]);
        fetchCartData();
      }
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || "কার্টে যোগ করতে ব্যর্থ");
    } finally {
      addToCartInFlightRef.current.delete(variantId);
      setCartLoadingItems((prev) => {
        const n = new Set(prev);
        n.delete(variantId);
        return n;
      });
    }
  };

  const removeFromCart = async (variantId: string) => {
    if (!sessionId) return;
    try {
      await api.delete(
        `/public/cart/remove/${variantId}?sessionId=${sessionId}`,
      );
      showToast.success("কার্ট থেকে সরানো হয়েছে");
      fetchCartData();
    } catch {
      showToast.error("সরাতে ব্যর্থ");
    }
  };

  const updateCartQty = async (variantId: string, qty: number) => {
    if (!sessionId) return;
    if (qty <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCartData((prev: any) => {
      if (!prev || !prev.items) return prev;
      return {
        ...prev,
        items: prev.items.map((item: any) =>
          item.variant?.id === variantId ? { ...item, quantity: qty } : item,
        ),
      };
    });
    try {
      await api.put("/public/cart/update", {
        variantId,
        quantity: qty,
        sessionId,
      });
      fetchCartData();
    } catch {
      showToast.error("আপডেট করতে ব্যর্থ");
      fetchCartData();
    }
  };

  // ========== WISHLIST FUNCTIONS ==========
  const fetchWishlistData = useCallback(async () => {
    if (!sessionId) return;
    setWishlistLoading(true);
    try {
      const res = await api.get(`/public/wishlist?sessionId=${sessionId}`);
      if (res.data.success) {
        const items = res.data.data || [];
        setWishlistData(items);
        setWishlistIds(new Set(items.map((i: any) => i.variantId)));
      }
    } catch {
      /* ignore */
    } finally {
      setWishlistLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) fetchWishlistData();
  }, [sessionId, fetchWishlistData]);

  const toggleWishlist = useCallback(
    async (variantId: string) => {
      if (!sessionId || !variantId) {
        showToast.error("পণ্য নির্বাচন করুন");
        return;
      }
      const isInWishlist = wishlistIds.has(variantId);
      try {
        if (isInWishlist) {
          await api.delete(
            `/public/wishlist/remove/${variantId}?sessionId=${sessionId}`,
          );
          setWishlistIds((prev) => {
            const n = new Set(prev);
            n.delete(variantId);
            return n;
          });
          setWishlistData((prev) =>
            prev.filter((i) => i.variantId !== variantId),
          );
          showToast.success("উইশলিস্ট থেকে বাদ দেওয়া হয়েছে");
        } else {
          await api.post("/public/wishlist/add", { variantId, sessionId });
          setWishlistIds((prev) => {
            const n = new Set(prev);
            n.add(variantId);
            return n;
          });
          fetchWishlistData();
          showToast.success("উইশলিস্টে যোগ হয়েছে!");
        }
      } catch (err: any) {
        if (
          err?.response?.status === 400 &&
          err?.response?.data?.message?.includes("wishlist")
        ) {
          setWishlistIds((prev) => {
            const n = new Set(prev);
            n.add(variantId);
            return n;
          });
          showToast.success("ইতিমধ্যে উইশলিস্টে আছে!");
        } else {
          showToast.error("ব্যর্থ হয়েছে");
        }
      }
    },
    [wishlistIds, sessionId, fetchWishlistData],
  );

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get(`/public/landing-page/${storeSlug}`);
      if (response.data.success) {
        setData(response.data.data);
        void api
          .get(`/marketing/meta/config/${encodeURIComponent(storeSlug)}`)
          .then((configResponse) => {
            const configData = configResponse.data?.data;
            if (configResponse.data?.success && configData) {
              setMetaConfigState({
                slug: storeSlug,
                config: {
                  enabled: Boolean(configData.enabled),
                  pixelId: typeof configData.pixelId === "string" ? configData.pixelId : null,
                  serverTrackingEnabled: Boolean(configData.serverTrackingEnabled),
                },
              });
            }
          })
          .catch(() => {
            setMetaConfigState({ slug: storeSlug, config: null });
          });

        // products stored in data; variants/variantProductMap derived below for compatibility
        setSelectedProduct(response.data.data.product || null);

        // ডিফল্ট ভ্যারিয়েন্ট/অ্যাট্রিবিউট অটো-সিলেক্ট করতে হবে না — ইউজার নিজেই বেছে নেবে
        setSelectedProduct(response.data.data.product || null);
        setSelectedVariant(null);
        setSelectedVariantAttrs({});
      }
    } catch (err: any) {
      showToast.error(
        err.response?.status === 404 ? "Page not found" : "Failed to load page",
      );
    } finally {
      setLoading(false);
    }
  }, [storeSlug]);

  useEffect(() => {
    fetchData();
    api.post(`/public/page-view/${storeSlug}`).catch(() => {});
  }, [fetchData, storeSlug]);

  const fetchReviews = useCallback(async () => {
    if (!data?.tenant?.id) return;
    try {
      setReviewsLoading(true);
      const res = await api.get(`/public/reviews/${data.tenant.id}`);
      if (res.data.success) setReviews(res.data.data);
    } catch {
      /* ignore */
    } finally {
      setReviewsLoading(false);
    }
  }, [data?.tenant?.id]);

  useEffect(() => {
    if (data?.tenant?.id) fetchReviews();
  }, [data?.tenant?.id, fetchReviews]);

  const handleReviewSubmit = async () => {
    if (!reviewName.trim() || !reviewText.trim()) {
      showToast.error("নাম ও রিভিউ লিখুন");
      return;
    }
    if (!data?.tenant?.id) {
      showToast.error("টেনেন্ট আইডি পাওয়া যায়নি");
      return;
    }
    setReviewSubmitting(true);
    try {
      if (editingReviewId) {
        await api.put(`/public/reviews/${editingReviewId}`, {
          name: reviewName,
          location: reviewLocation,
          text: reviewText,
          stars: reviewStars,
          phone: reviewPhone || undefined,
        });
        showToast.success("রিভিউ আপডেট হয়েছে!");
      } else {
        await api.post("/public/reviews", {
          tenantId: data.tenant.id,
          name: reviewName,
          location: reviewLocation,
          text: reviewText,
          stars: reviewStars,
          phone: reviewPhone || undefined,
        });
        showToast.success("রিভিউ জমা হয়েছে! ধন্যবাদ 🙏");
      }
      setShowReviewForm(false);
      setEditingReviewId(null);
      setReviewName("");
      setReviewLocation("");
      setReviewText("");
      setReviewStars(5);
      fetchReviews();
    } catch (err: any) {
      showToast.error(
        err.response?.data?.message || "রিভিউ জমা দিতে সমস্যা হয়েছে",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleEditReview = (r: Review) => {
    setEditingReviewId(r.id);
    setReviewName(r.name);
    setReviewLocation(r.location);
    setReviewText(r.text);
    setReviewStars(r.stars);
    setReviewPhone(r.phone || "");
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("আপনি কি এই রিভিউটি ডিলিট করতে চান?")) return;
    try {
      await api.delete(`/public/reviews/${id}`, {
        data: { phone: reviewPhone || undefined },
      });
      showToast.success("রিভিউ ডিলিট হয়েছে");
      fetchReviews();
    } catch {
      showToast.error("ডিলিট করতে সমস্যা হয়েছে");
    }
  };

  const validateAndApplyCoupon = async (code: string) => {
    if (!code.trim()) {
      setAppliedDiscount(0);
      return;
    }
    setValidatingCoupon(true);
    try {
      const subtotal = selectedVariant ? selectedVariant.price * quantity : 0;
      const response = await api.post("/public/coupon/validate", {
        code: code.toUpperCase(),
        subtotal,
        variantId: selectedVariant?.id,
      });
      if (response.data.success) {
        setAppliedDiscount(response.data.data.discountAmount || 0);
        showToast.success(
          `কুপন প্রয়োগ করা হয়েছে! ৳${response.data.data.discountAmount} ছাড়`,
        );
      } else {
        setAppliedDiscount(0);
        showToast.error(response.data.message || "কুপন বৈধ নয়");
      }
    } catch (err: any) {
      setAppliedDiscount(0);
      showToast.error(err.response?.data?.message || "কুপন যাচাই ব্যর্থ হয়েছে");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const onSubmitOrder = async (formData: OrderFormData) => {
    if (!selectedVariant || (!selectedVariant.isPreOrder && selectedVariant.stock <= 0)) {
      showToast.error(selectedVariant ? "এই ভ্যারিয়েন্টটি স্টকে নেই" : "সাইজ ও কালার সিলেক্ট করুন");
      return;
    }
    if (orderSubmissionInFlightRef.current) return;
    orderSubmissionInFlightRef.current = true;
    setOrderLoading(true);
    try {
      const response = await api.post("/public/orders", {
        variantId: selectedVariant.id,
        attributes: selectedVariantAttrs,
        price: selectedVariant.price,
        quantity,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        customerEmail: formData.customerEmail || undefined,
        notes: formData.notes || undefined,
        couponCode: couponCode.toUpperCase() || undefined,
        discountAmount: appliedDiscount,
        paymentMethod: formData.paymentMethod || "CASH_ON_DELIVERY",
        ...getOrderMarketingFields(),
      });
      if (response.data.success) {
        const orderId = response.data.data?.orderId;
        if (typeof orderId === "string" && orderId) trackPurchase(orderId);
        setOrderSuccess({
          orderNumber: response.data.data?.orderNumber || "N/A",
        });
        reset();
        setCouponCode("");
        setAppliedDiscount(0);
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || "";
      const errData = err?.response?.data?.data || {};
      if (status === 429) {
        showToast.dismiss();
        if (msg.includes("wait")) {
          const waitSec = errData?.waitSeconds || 0;
          const orderNo = errData?.lastOrderNumber || "";
          const minutes = Math.floor(waitSec / 60);
          const seconds = waitSec % 60;
          const timeText =
            minutes > 0
              ? `${minutes} মিনিট ${seconds > 0 ? `${seconds} সেকেন্ড` : ""}`
              : `${waitSec} সেকেন্ড`;
          showToast.error(
            `⏳ দয়া অপেক্ষা করুন!\nঅর্ডার (#${orderNo}) ইতিমধ্যে দেওয়া হয়েছে।\n${timeText} পর চেষ্টা করুন।`,
            { duration: 6000, position: "top-center" },
          );
        } else if (msg.includes("Daily"))
          showToast.error("📦 দৈনিক সীমা শেষ! আগামীকাল চেষ্টা করুন।", {
            duration: 5000,
            position: "top-center",
          });
        else showToast.error(msg, { duration: 4000 });
      } else if (status === 403)
        showToast.error(`🚫 ${msg || "এই ফোন নম্বরটি ব্লক করা আছে।"}`, {
          duration: 5000,
          position: "top-center",
        });
      else if (msg.includes("11 digits"))
        showToast.error("📱 ভুল ফোন নম্বর! ১১ ডিজিটের বৈধ নম্বর দিন।", {
          duration: 5000,
          position: "top-center",
        });
      else
        showToast.error(msg || "অর্ডার করতে সমস্যা হয়েছে, আবার চেষ্টা করুন", {
          duration: 4000,
        });
    } finally {
      orderSubmissionInFlightRef.current = false;
      setOrderLoading(false);
    }
  };

  const updateCartItemVariant = useCallback(
    async (cartItemId: string, newVariantId: string) => {
      if (!sessionId) return;
      const newVariant = variants.find((v) => v.id === newVariantId);
      const currentItem = cartData?.items?.find(
        (item: any) => item.id === cartItemId,
      );
      const oldVariantId = currentItem?.variant?.id;
      const oldProductId =
        currentItem?.variant?.product?.id || currentItem?.variant?.productId;

      setCartData((prev: any) => {
        if (!prev || !prev.items) return prev;
        const updated = prev.items.map((item: any) =>
          item.id === cartItemId
            ? {
                ...item,
                variantId: newVariantId,
                variant: newVariant || item.variant,
              }
            : item,
        );
        const final =
          oldVariantId && oldVariantId !== newVariantId && oldProductId
            ? updated.filter((item: any) => {
                const sameProduct =
                  (item.variant?.product?.id || item.variant?.productId) ===
                  oldProductId;
                const isOld = item.variant?.id === oldVariantId;
                return !(sameProduct && isOld);
              })
            : updated;
        return { ...prev, items: final };
      });

      if (oldVariantId && oldVariantId !== newVariantId) {
        await removeFromCart(oldVariantId);
      }

      if (newVariant?.attributes) {
        const attrs: { [key: string]: string } = {};
        Object.entries(newVariant.attributes).forEach(
          ([key, val]: [string, any]) => {
            if (Array.isArray(val)) attrs[key] = val[0];
            else if (typeof val === "string" && val.startsWith("[")) {
              try {
                const p = JSON.parse(val);
                attrs[key] = Array.isArray(p) ? p[0] : val;
              } catch {
                attrs[key] = val;
              }
            } else attrs[key] = val;
          },
        );
        setSelectedItemAttrs((prev) => ({ ...prev, [cartItemId]: attrs }));
      }
    },
    [variants, sessionId, cartData, removeFromCart],
  );

  const handleCartOrderSubmit = async (formData: OrderFormData) => {
    if (!cartData?.items?.length) {
      showToast.error("কার্ট খালি!");
      return;
    }
    const selectedVariantIds = Array.from(selectedCartItems);
    if (selectedVariantIds.length === 0) {
      showToast.error("অনুগ্রহ করে অন্তত একটি পণ্য নির্বাচন করুন");
      return;
    }
    if (cartOrderSubmissionInFlightRef.current) return;
    cartOrderSubmissionInFlightRef.current = true;
    setCartOrderProcessing(true);
    try {
      const itemsToRemove = cartData.items.filter(
        (item: any) => !selectedCartItems.has(item.variant?.id),
      );
      for (const item of itemsToRemove)
        await api.delete(
          `/public/cart/remove/${item.variant.id}?sessionId=${sessionId}`,
        );
      const response = await api.post("/public/orders", {
        sessionId,
        selectedAttributes: Object.fromEntries(
          cartData.items
            .filter((item: any) => selectedCartItems.has(item.variant?.id))
            .map((item: any) => [
              item.variant.id,
              selectedItemAttrs[item.id] || {},
            ]),
        ),
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        customerEmail: formData.customerEmail || undefined,
        notes: formData.notes || undefined,
        couponCode: couponCode.toUpperCase() || undefined,
        discountAmount: appliedDiscount,
        paymentMethod: formData.paymentMethod || "CASH_ON_DELIVERY",
        ...getOrderMarketingFields(),
      });
      if (response.data.success) {
        const orderId = response.data.data?.orderId;
        if (typeof orderId === "string" && orderId) trackPurchase(orderId);
        setOrderSuccess({
          orderNumber: response.data.data?.orderNumber || "N/A",
        });
        reset();
        setCouponCode("");
        setAppliedDiscount(0);
        setIsCartOrder(false);
        setSelectedCartItems(new Set());
        setCartDrawerOpen(false);
        await fetchCartData();
        showToast.success("অর্ডার সফল হয়েছে!");
      }
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || "কার্ট অর্ডার করতে ব্যর্থ");
    } finally {
      cartOrderSubmissionInFlightRef.current = false;
      setCartOrderProcessing(false);
    }
  };

  const theme: ThemeConfig = themeConfigs[currentTheme] || themeConfigs.original;
  const PRIMARY = "#E11D48"; // rose-600
  const PRIMARY_DARK = "#BE123C"; // rose-700
  const PRIMARY_LIGHT = "#FFF1F2"; // rose-50
  const PRIMARY_MUTED = "#d1fae5";

  const bengaliDigits: { [key: string]: string } = {
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯",
  };
  const weekdaysBn = [
    "রবিবার",
    "সোমবার",
    "মঙ্গলবার",
    "বুধবার",
    "বৃহস্পতিবার",
    "শুক্রবার",
    "শনিবার",
  ];
  const monthsBn = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];
  const formatBanglaNum = (n: number | string) =>
    String(n).replace(/\d/g, (d) => bengaliDigits[d] || d);

  const formatVariantAttrs = (attrs: { [key: string]: any }): string => {
    if (!attrs) return "";
    return Object.values(attrs)
      .map((v) => {
        if (Array.isArray(v)) return v.join(" / ");
        if (typeof v === "string" && v.startsWith("[")) {
          try {
            const parsed = JSON.parse(v);
            if (Array.isArray(parsed)) return parsed.join(" / ");
          } catch {}
          return v;
        }
        return v;
      })
      .join(" / ");
  };

  const formatVariantAttrsWithSelection = (
    attrs: { [key: string]: any },
    selectedAttrs: { [key: string]: string },
  ): string => {
    if (!attrs) return "";
    const allKeys = Object.keys(attrs);
    return allKeys
      .map((key) => {
        const val = attrs[key];
        const parsed = (() => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string" && val.startsWith("[")) {
            try {
              const p = JSON.parse(val);
              if (Array.isArray(p)) return p;
            } catch {}
          }
          return null;
        })();
        if (parsed && parsed.length > 1 && selectedAttrs[key]) {
          return selectedAttrs[key];
        }
        if (Array.isArray(val)) return val[0];
        return val;
      })
      .join(" / ");
  };
  const formatBanglaDate = (date: Date) =>
    `${weekdaysBn[date.getDay()]}, ${formatBanglaNum(date.getDate())} ${monthsBn[date.getMonth()]} ${formatBanglaNum(date.getFullYear())}`;
  const getBdDate = () => new Date(bdTime.getTime() + 6 * 60 * 60 * 1000);
  const bdDateObj = getBdDate();

  const switchToSingleProductOrder = () => {
    setIsCartOrder(false);
    setSelectedCartItems(new Set());
  };

  const scrollToHero = useCallback(() => {
    const el = document.getElementById("hero-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleHeroWishlist = useCallback(() => {
    if (selectedVariant) toggleWishlist(selectedVariant.id);
    else showToast.error("পণ্য নির্বাচন করুন");
  }, [selectedVariant, toggleWishlist]);

  const scrollToOrder = useCallback(() => {
    const el = document.getElementById("order-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // ভ্যারিয়েন্ট বদলে সিলেক্টেড ভ্যারিয়েন্ট আপডেট (স্ক্রল/ভিউমোড পরিবর্তন ছাড়া)
  // গ্যালারি ইমেজ ক্লিকে ভ্যারিয়েন্ট বদলে অ্যাট্রিবিউট প্রি-সিলেক্ট করা হয় না — ইউজার নিজেই বেছে নেবে
  const switchVariant = useCallback(
    (variant: Variant) => {
      setSelectedVariant(variant);
      setQuantity(1);
      const product = getProductForVariant(variant.id);
      setSelectedProduct(product || data?.product || null);
    },
    [getProductForVariant, data?.product],
  );

  // Explicitly open details for a product/variant (card click / কিনুন)
  const openDetail = useCallback(
    (productId: string, variantId: string) => {
      cameFromListRef.current = true;
      const product = allProducts.find((p) => p.id === productId) || getProductForVariant(variantId) || data?.product || null;
      const variant =
        (product?.variants || []).find((v) => v.id === variantId) ||
        variants.find((v) => v.id === variantId) ||
        null;
      if (variant) {
        setSelectedVariant(variant);
        setSelectedProduct(product);
        setQuantity(1);
        const pid = product?.id || variant.productId;
        if (pid && viewedProductIdRef.current !== pid) {
          viewedProductIdRef.current = pid;
          trackMetaEvent("ViewContent", [{ productId: pid, quantity: 1 }]);
        }
      } else if (product) {
        setSelectedProduct(product);
      }
      const sp = new URLSearchParams(searchParams.toString());
      sp.set("variant", variantId);
      router.push(`/${storeSlug}?${sp.toString()}`, { scroll: false });
      setTimeout(() => {
        const el = document.getElementById("hero-section");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    },
    [allProducts, getProductForVariant, variants, data?.product, router, searchParams, storeSlug, trackMetaEvent],
  );

  // Sync selection from ?variant= (URL is source of truth)
  useEffect(() => {
    if (!data) return;
    const vId = searchParams.get("variant");
    if (!vId || !variants.length) return;
    const variant = variants.find((v) => v.id === vId);
    if (!variant) return;
    if (selectedVariant?.id !== vId) {
      setSelectedVariant(variant);
      setSelectedProduct(getProductForVariant(vId) || data.product || null);
    }
  }, [data, searchParams, variants, getProductForVariant, selectedVariant?.id]);

  // Cap quantity to stock in detail view
  useEffect(() => {
    if (!selectedVariant?.id) return;
    const stock = selectedVariant.stock ?? 0;
    if (stock > 0 && quantity > stock) {
      setQuantity(Math.max(1, stock));
    }
  }, [selectedVariant?.id, selectedVariant?.stock, quantity]);
  const updateVariantAndProduct = useCallback(
    (variant: Variant) => {
      setSelectedVariant(variant);
      setQuantity(1);
      const product = getProductForVariant(variant.id);
      const productId = product?.id || variant.productId;
      if (productId && viewedProductIdRef.current !== productId) {
        viewedProductIdRef.current = productId;
        trackMetaEvent("ViewContent", [{ productId, quantity: 1 }]);
      }
      setSelectedProduct(product || data?.product || null);
      const sp = new URLSearchParams(searchParams.toString());
      sp.set("variant", variant.id);
      router.replace(`/${storeSlug}?${sp.toString()}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [getProductForVariant, data?.product, trackMetaEvent, searchParams, router, storeSlug],
  );

  const syncHeroVariant = useCallback(
    (variant: Variant | null, attributes: Record<string, string>) => {
      setSelectedVariantAttrs((prev) => {
        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(attributes);
        if (prevKeys.length === nextKeys.length && nextKeys.every((k) => prev[k] === attributes[k])) return prev;
        return attributes;
      });
      if (variant) {
        setSelectedVariant((prev) => (prev?.id === variant.id ? prev : variant));
        const product = getProductForVariant(variant.id);
        setSelectedProduct((prev) => {
          const next = product || data?.product || null;
          return prev?.id === next?.id ? prev : next;
        });
        const current = searchParams.get("variant");
        if (current !== variant.id) {
          const sp = new URLSearchParams(searchParams.toString());
          sp.set("variant", variant.id);
          router.replace(`/${storeSlug}?${sp.toString()}`, { scroll: false });
        }
      } else {
        setSelectedVariant(null);
      }
    },
    [getProductForVariant, data?.product, searchParams, router, storeSlug],
  );

  // হোমে ফেরার ফাংশন
  const goToHome = useCallback(() => {
    viewedProductIdRef.current = null;
    checkoutInitiatedRef.current = false;
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("variant");
    const homeUrl = sp.toString() ? `/${storeSlug}?${sp.toString()}` : `/${storeSlug}`;
    if (cameFromListRef.current && typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.replace(homeUrl, { scroll: false });
    }
    cameFromListRef.current = false;
    setTimeout(() => {
      const grid = document.querySelector('[data-product-grid="true"]');
      if (grid instanceof HTMLElement) {
        grid.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 80);
  }, [router, searchParams, storeSlug]);

  if (loading)
    return (
      <div
        className="flex items-center justify-center min-h-screen rounded-sm"
        style={{ background: "#fafaf5" }}
      >
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-sm border-4 border-red-100"></div>
            <div className="absolute inset-0 rounded-sm border-4 border-t-red-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-sm bg-white flex items-center justify-center">
              <FaLeaf className="text-red-600 text-lg" />
            </div>
          </div>
          <p className="text-gray-600 text-sm font-semibold">লোড হচ্ছে...</p>
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 rounded-sm">
        পেজ পাওয়া যায়নি
      </div>
    );

  if (orderSuccess)
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 rounded-sm"
        style={{ background: "#fafaf5" }}
      >
        <div className="max-w-md w-full p-8 text-center bg-white shadow-xl border border-red-100 rounded-sm">
          <div
            className="w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg rounded-sm"
            style={{
              background: `linear-gradient(135deg,${PRIMARY},${PRIMARY_DARK})`,
            }}
          >
            <FaCheckCircle className="text-white text-4xl" />
          </div>
          <h2 className="text-3xl font-black mb-2 text-gray-800">
            অর্ডার সফল! 🎉
          </h2>
          <p className="text-gray-500 mb-4 text-sm">আপনার অর্ডার নম্বর</p>
          <div
            className="text-white text-3xl font-black py-4 px-8 mb-6 shadow-lg rounded-sm"
            style={{
              background: `linear-gradient(135deg,${PRIMARY},${PRIMARY_DARK})`,
            }}
          >
            #{orderSuccess.orderNumber}
          </div>
          <p className="text-gray-500 text-sm mb-6">
            আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।
          </p>
          <div className="flex gap-3">
            <a
              href={`https://wa.me/${(data.page?.socialLinks?.whatsapp || data.tenant?.phone || "").replace(/\D/g, "")}?text=আমার অর্ডার নম্বর: ${orderSuccess.orderNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-white0 hover:bg-red-600 text-white font-bold py-3 transition-all text-sm rounded-sm"
            >
              <FaWhatsapp /> ট্র্যাক করুন
            </a>
            <button
              onClick={() => {
                setOrderSuccess(null);
                setSelectedVariant(null);
                setQuantity(1);
                viewedProductIdRef.current = null;
                checkoutInitiatedRef.current = false;
                const sp = new URLSearchParams(searchParams.toString());
                sp.delete("variant");
                router.replace(sp.toString() ? `/${storeSlug}?${sp.toString()}` : `/${storeSlug}`, { scroll: false });
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 text-sm rounded-sm"
            >
              নতুন অর্ডার
            </button>
          </div>
        </div>
      </div>
    );

  // ========== MAIN RENDER ==========
  const displayLogo = data.page?.logoUrl || data.tenant?.logo || null;
  const displayPhone =
    data.page?.phoneNumber || data.tenant?.phone || "01234567890";
  const displayPhone2 = data.page?.phoneNumber2 || data.tenant?.phone2 || "";
  const displayEmail =
    data.page?.emailAddress ||
    data.tenant?.tenantEmail ||
    data.tenant?.email ||
    "";
  const displayAddress = data.page?.address || data.tenant?.address || "";
  const displaySocialLinks =
    data.page?.socialLinks || data.tenant?.socialLinks || {};
  const termsContent =
    data.page?.termsContent || data.tenant?.termsAndConditions || "";
  const whatsappNumberRaw = displaySocialLinks.whatsapp || displayPhone;
  const whatsappNumber = String(whatsappNumberRaw).replace(/\D/g, "");
  const deliveryCharge = Number(data.tenant?.deliveryCharge) || 0;
  const isFreeDelivery = deliveryCharge === 0;
  const companyName =
    data.tenant.companyName || data.tenant.name || "আমাদের শপ";
  const pf = data.tenant?.productFeatures || {};
  const tagline = pf.tagline || "";
  const badge = pf.badge || "";
  const features =
    pf.features && Array.isArray(pf.features) && pf.features.length > 0
      ? pf.features
      : [];
  const variantDetails =
    pf.variantDetails &&
    Array.isArray(pf.variantDetails) && pf.variantDetails.length > 0
      ? pf.variantDetails
      : [];
  const trustBar =
    pf.trustBar && Array.isArray(pf.trustBar) && pf.trustBar.length > 0
      ? pf.trustBar
      : [];
  const faqs: { q: string; a: string }[] = [];
  const categories = data.categories || [];
  const brands = data.brands || [];

  const getAllImages = (): string[] => {
    const imgs: string[] = [];
    const activeProduct = selectedProduct || data?.product;
    if (
      selectedVariant?.variantImages &&
      Array.isArray(selectedVariant.variantImages)
    ) {
      if (currentColor) {
        const found = selectedVariant.variantImages.find(
          (img: any) =>
            img.color?.toLowerCase() === currentColor.toLowerCase() ||
            img.altText?.toLowerCase() === currentColor.toLowerCase(),
        );
        if (found?.url && !imgs.includes(found.url)) imgs.push(found.url);
      } else {
        const colorAttrKey = Object.keys(selectedVariant.attributes || {}).find(
          (k) => k.toLowerCase().includes("color"),
        );
        if (colorAttrKey) {
          const colorAttr = selectedVariant.attributes[colorAttrKey];
          const colorValues = Array.isArray(colorAttr)
            ? colorAttr
            : typeof colorAttr === "string" && colorAttr.startsWith("[")
              ? (() => {
                  try {
                    return JSON.parse(colorAttr);
                  } catch {
                    return [];
                  }
                })()
              : colorAttr  
                ? [colorAttr]
                : [];
          if (colorValues.length > 0) {
            const found = selectedVariant.variantImages.find(
              (img: any) =>
                img.color?.toLowerCase() === colorValues[0].toLowerCase() ||
                img.altText?.toLowerCase() === colorValues[0].toLowerCase(),
            );
            if (found?.url && !imgs.includes(found.url)) imgs.push(found.url);
          }
        }
      }
    }
    if (selectedVariant?.image && !imgs.includes(selectedVariant.image))
      imgs.push(selectedVariant.image);
    if (activeProduct?.images && Array.isArray(activeProduct.images))
      activeProduct.images.forEach((img) => {
        if (
          img &&
          (img.startsWith("http") || img.startsWith("data:")) &&
          !imgs.includes(img)
        )
          imgs.push(img);
      });
    if (activeProduct?.variants && Array.isArray(activeProduct.variants))
      activeProduct.variants.forEach((v) => {
        if (v.image && !imgs.includes(v.image)) imgs.push(v.image);
      });
    return imgs;
  };
  const allImages = getAllImages();
  const productImage = allImages[0] || null;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((a, r) => a + r.stars, 0) / reviews.length
      : 4.9;
  const reviewsCount = reviews.length;

  const orderNowLink = "#order-form";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(data.product?.name || "পণ্য")} সম্পর্কে জানতে চাই`;
  const whatsappVariantLink = (variantName: string) => {
    const text = `${selectedProduct?.name || data.product?.name || "পণ্য"} - ${variantName} - ৳${selectedVariant?.price ?? ""} - পরিমাণ: ${quantity} - Variant ID: ${selectedVariant?.id ?? ""}`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const isOutOfStock = (v: Variant) => v.stock <= 0;

  return (
    <div
      style={{
        fontFamily: "'Hind Siliguri','Noto Sans Bengali',sans-serif",
        background: "#FAF7F2 ",
        minHeight: "100vh",
      }}
      className="rounded-sm"
    >
      <style>{`
        *{box-sizing:border-box}
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .cat-item:hover{background:#fff8f0;color:#ea6c00}
        .cat-item{transition:all .15s}
        input:focus,textarea:focus,select:focus{outline:none}
        .variant-card { transition: all 0.25s cubic-bezier(0.2, 0, 0, 1); }
        .variant-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -12px rgba(0,0,0,0.15); }
        .selected-variant { border: 2px solid ${PRIMARY}; box-shadow: 0 0 0 3px ${PRIMARY}40; background: ${PRIMARY_MUTED}; }
        .floating-btn { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(250,127,46,0.4); } 70% { box-shadow: 0 0 0 10px rgba(250,127,46,0); } 100% { box-shadow: 0 0 0 0 rgba(250,127,46,0); } }
        .sidebar-drawer { transition: transform 0.3s ease-in-out; }
        .glow-border-wrap{position:relative;overflow:hidden;border-radius:2px}
        .glow-border-wrap::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:conic-gradient(from 0deg,transparent 0%,#06d93745%,transparent 60%,#06d93745%,transparent 60%,#06d93775%,transparent 90%);animation:spinGlow 4s linear infinite;z-index:0;opacity:0.5;pointer-events:none}
        @keyframes spinGlow{to{transform:rotate(360deg)}}
        .glow-border-content{position:relative;z-index:1;margin:2px;height:calc(100% - 4px);overflow:hidden;border-radius:1px}
      `}</style>

      {/* Announcement bar */}
      <div
        className="w-full px-4 sm:px-6 py-2 text-center text-[13px] font-medium text-white"
        style={{ background: `var(--primary,#e11d48)` }}
      >
        {(data?.tenant?.companyName || data?.tenant?.name) ? `${data.tenant.companyName || data.tenant.name} — এক্সপ্রেস ডেলিভারি, আজেই অর্ডার করুন` : "এক্সপ্রেস ডেলিভারি - আজেই অর্ডার করুন"}
      </div>

      <Navbar
        displayLogo={displayLogo}
        displayPhone={displayPhone}
        companyName={companyName}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        suggestions={suggestions}
        updateVariantAndProduct={updateVariantAndProduct}
        wishlistIds={wishlistIds}
        setWishlistDrawerOpen={setWishlistDrawerOpen}
        cartCount={cartCount}
        setCartDrawerOpen={setCartDrawerOpen}
        mobileSearchOpen={mobileSearchOpen}
        setMobileSearchOpen={setMobileSearchOpen}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        isScrolled={isScrolled}
        primary={PRIMARY}
        whatsappNumber={whatsappNumber}
        data={data}
      />


      <MobileSidebar
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        categories={categories}
        brands={brands}
        variants={variants}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        selectedBrand={selectedBrand}
        expandedCategoryId={expandedCategoryId}
        expandedBrandId={expandedBrandId}
        onSelectCategory={(id) => setSelectedCategory(id)}
        onSelectSubcategory={(id) => setSelectedSubcategory(id)}
        onSelectBrand={(id) => setSelectedBrand(id)}
        onExpandCategory={(id) => setExpandedCategoryId(id)}
        onExpandBrand={(id) => setExpandedBrandId(id)}
        onUpdateVariant={updateVariantAndProduct}
        priceMin={priceMin}
        priceMax={priceMax}
        onPriceMinChange={setPriceMin}
        onPriceMaxChange={setPriceMax}
        primary={PRIMARY}
      />

      <div className="max-w-[1590px] mx-auto sm:px-6 py-3 lg:py-4 pb-10 lg:pb-14">
  {/* ===== হোম মোড – Hero banner, categories, products, and reviews ===== */}
  {viewMode === "home" && (
    <div className="flex flex-col gap-8 lg:gap-12">
      {/* First-screen group: strip + banner + category + আজকের অফার (tight) */}
      <div className="flex flex-col gap-5 lg:gap-6">
        {categories.length > 1 && (
          <CategoryNavStrip
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(id) => {
              setSelectedCategory(id);
              setSelectedSubcategory(null);
            }}
            primary={PRIMARY}
          />
        )}

        <HeroBanner
          banners={(data.banners || []).map((banner) => ({
            image: banner.imageUrl,
            link: banner.linkUrl,
            alt: banner.title,
            categoryId: banner.categoryId,
          }))}
          featured={allProducts}
          onOpenDetails={(productId, variantId) => openDetail(productId, variantId)}
          onBannerClick={(banner) => {
            if (banner.categoryId) {
              setSelectedCategory(banner.categoryId);
              setSelectedSubcategory(null);
              const sp = new URLSearchParams(searchParams.toString());
              sp.delete("variant");
              router.replace(sp.toString() ? `/${storeSlug}?${sp.toString()}` : `/${storeSlug}`, { scroll: false });
            } else if (banner.link) {
              window.open(banner.link, "_blank", "noopener,noreferrer");
            }
          }}
          primary={PRIMARY}
          placeholder
        />

        <CategoryTiles
          categories={categories.slice(0, 7).map((category) => ({
            id: category.id,
            name: category.name,
            image: category.image || category.imageUrl || category.thumbnail || null,
          }))}
          onSelectCategory={(id) => {
            setSelectedCategory(selectedCategory === id ? null : id);
            setSelectedSubcategory(null);
          }}
          placeholder
        />

        {/* <AnimSection delay={90}>
          <BestProductsSection
            products={allProducts}
            wishlistIds={wishlistIds}
            addToCart={addToCart}
            onOpenDetails={(productId, variantId) => {
              const p = allProducts.find((x) => x.id === productId);
              if (p?.id) trackMetaEvent("InitiateCheckout", [{ productId: p.id, quantity: 1 }]);
              openDetail(productId, variantId);
            }}
            toggleWishlist={toggleWishlist}
            primary={PRIMARY}
          />
        </AnimSection> */}

        {/* পণ্যের গ্রিড (heading + filter toolbar VariantsGrid-এর ভেতরেই আছে) */}
        <AnimSection delay={90}>
          <VariantsGrid
            products={filteredProducts}
            wishlistIds={wishlistIds}
            cartLoading={cartLoadingItems.size > 0}
            addToCart={addToCart}
            onOpenDetails={(productId, variantId) => {
              const p = allProducts.find((x) => x.id === productId);
              if (p?.id) trackMetaEvent("InitiateCheckout", [{ productId: p.id, quantity: 1 }]);
              openDetail(productId, variantId);
            }}
            toggleWishlist={toggleWishlist}
            sortBy={sortBy}
            setSortBy={setSortBy}
            activeFiltersCount={activeFiltersCount}
            clearFilters={clearFilters}
            primary={PRIMARY}
          />
        </AnimSection>
      </div>

      {/* Lower group: pre-order + reviews (বড় gap) */}
      <div className="flex flex-col gap-10 lg:gap-12">
        <AnimSection delay={120}>
          <PreOrderSection
            products={allProducts}
            wishlistIds={wishlistIds}
            addToCart={addToCart}
            onOpenDetails={(productId, variantId) => {
              const p = allProducts.find((x) => x.id === productId);
              if (p?.id) trackMetaEvent("InitiateCheckout", [{ productId: p.id, quantity: 1 }]);
              openDetail(productId, variantId);
            }}
            toggleWishlist={toggleWishlist}
            primary={PRIMARY}
          />
        </AnimSection>

        {/* গ্রাহকের রিভিউ */}
        {!reviewsLoading && (
          <AnimSection delay={120}>
            <ReviewsSection
              reviews={reviews}
              reviewsLoading={reviewsLoading}
              avgRating={avgRating}
              showReviewForm={showReviewForm}
              setShowReviewForm={setShowReviewForm}
              editingReviewId={editingReviewId}
              reviewName={reviewName}
              reviewLocation={reviewLocation}
              reviewText={reviewText}
              reviewStars={reviewStars}
              reviewPhone={reviewPhone}
              reviewSubmitting={reviewSubmitting}
              setEditingReviewId={setEditingReviewId}
              setReviewName={setReviewName}
              setReviewLocation={setReviewLocation}
              setReviewText={setReviewText}
              setReviewStars={setReviewStars}
              setReviewPhone={setReviewPhone}
              onReviewSubmit={handleReviewSubmit}
              onEditReview={handleEditReview}
              onDeleteReview={handleDeleteReview}
              primary={PRIMARY}
            />
          </AnimSection>
        )}
      </div>
    </div>
  )}

  {/* ===== ডিটেইল মোড – Hero + OrderForm + Reviews + FAQ + Contact ===== */}
  {viewMode === "detail" && (
    <div className="flex flex-col gap-10 lg:gap-12">
      {/* Back button + Hero (কাছাকাছি) */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-start px-3 sm:px-0">
          <button
            onClick={goToHome}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-sm transition-colors"
          >
            <FaChevronLeft size={12} />
            পণ্যের তালিকায় ফিরে যান
          </button>
        </div>

        <AnimSection>
          <div id="hero-section">
            <HeroSection
              selectedVariant={selectedVariant}
              selectedProduct={selectedProduct}
              data={data as unknown as Parameters<typeof HeroSection>[0]["data"]}
              variants={variants}
              productImage={productImage}
              allImages={allImages}
              activeGallery={activeGallery}
              setActiveGallery={setActiveGallery}
              quantity={quantity}
              setQuantity={setQuantity}
              roundToStep={roundToStep}
              QUANTITY_STEP={QUANTITY_STEP}
              avgRating={avgRating}
              reviewsCount={reviewsCount}
              trustBar={trustBar}
              features={features}
              variantDetails={variantDetails}
              badge={badge}
              tagline={tagline}
              addToCart={addToCart}
              onInitiateCheckout={(productId, checkoutQuantity) =>
                initiateCheckout([{ productId, quantity: checkoutQuantity }])
              }
              updateVariantAndProduct={updateVariantAndProduct}
              switchVariant={switchVariant}
              toggleWishlist={toggleWishlist}
              cartLoadingItems={cartLoadingItems}
              wishlistIds={wishlistIds}
              isFreeDelivery={isFreeDelivery}
              formatBanglaNum={formatBanglaNum}
              formatBanglaDate={formatBanglaDate}
              bdDateObj={bdDateObj}
              primary={PRIMARY}
              primaryDark={PRIMARY_DARK}
              primaryMuted={PRIMARY_MUTED}
              primaryLight={PRIMARY_LIGHT}
              orderNowLink={orderNowLink}
              whatsappLink={whatsappLink}
              whatsappVariantLink={whatsappVariantLink}
              heroWishlistBtnClass=""
              onColorChange={setCurrentColor}
              onVariantAttrsChange={setSelectedVariantAttrs}
              onVariantChange={syncHeroVariant}
            />
          </div>
        </AnimSection>
      </div>

      {/* Order form + summary */}
      <div className="relative" id="order-form">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-3">
            <AnimSection delay={160}>
              <OrderForm
                isCartOrder={isCartOrder}
                cartData={cartData}
                selectedCartItems={selectedCartItems}
                setSelectedCartItems={setSelectedCartItems}
                selectedVariantAttrs={selectedVariantAttrs}
                selectedVariant={selectedVariant}
                quantity={quantity}
                setQuantity={setQuantity}
                roundToStep={roundToStep}
                QUANTITY_STEP={QUANTITY_STEP}
                variants={variants}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                appliedDiscount={appliedDiscount}
                validatingCoupon={validatingCoupon}
                validateAndApplyCoupon={validateAndApplyCoupon}
                orderLoading={orderLoading}
                cartOrderProcessing={cartOrderProcessing}
                onSubmitOrder={onSubmitOrder}
                onCartOrderSubmit={handleCartOrderSubmit}
                register={register}
                errors={errors}
                handleSubmit={handleSubmit}
                switchToSingleProductOrder={switchToSingleProductOrder}
                reset={reset}
                primary={PRIMARY}
                primaryDark={PRIMARY_DARK}
                primaryMuted={PRIMARY_MUTED}
                isFreeDelivery={isFreeDelivery}
                deliveryCharge={deliveryCharge}
                cartItemVariants={cartItemVariants}
                selectedItemAttrs={selectedItemAttrs}
                setSelectedItemAttrs={setSelectedItemAttrs}
                updateCartItemVariant={updateCartItemVariant}
                allVariants={variants}
              />
            </AnimSection>
          </div>

          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-[113px]">
              <div className="bg-white border border-gray-200 rounded-sm shadow-md overflow-hidden">
                <div
                  className="p-4 border-b"
                  style={{ background: PRIMARY_MUTED }}
                >
                  <h3 className="font-black text-gray-800 text-sm flex items-center gap-2">
                    <FaShoppingCart style={{ color: PRIMARY }} />
                    {isCartOrder
                      ? "কার্টের পণ্য সমূহ"
                      : "অর্ডার সারসংক্ষেপ"}
                  </h3>
                </div>
                <div className="p-5">
                  {isCartOrder &&
                  cartData?.items &&
                  cartData.items.length > 0 ? (
                    <div className="space-y-3">
                      {cartData.items
                        .filter((ci: any) =>
                          selectedCartItems.has(ci.variant?.id),
                        )
                        .map((cartItem: any, idx: number) => {
                          const v = cartItem.variant;
                          const selAttrs =
                            selectedItemAttrs?.[cartItem.id] || {};
                          const attrLabel =
                            Object.keys(selAttrs).length > 0
                              ? Object.values(selAttrs).join(" / ")
                              : formatVariantAttrs(v?.attributes || {});
                          const itemTotal =
                            (v?.price || 0) * cartItem.quantity;
                          return (
                            <div
                              key={idx}
                              style={{ border: `1px solid ${PRIMARY}20`, background: `${PRIMARY}03` }}
                              className="group relative overflow-hidden flex items-start gap-3 rounded-sm p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                            >
                              <div className="relative shrink-0">
                                {v?.image ? (
                                  <img
                                    src={v.image}
                                    alt={v?.product?.name || "Product"}
                                    className="h-16 w-16 object-cover rounded-sm border"
                                    style={{ borderColor: `${PRIMARY}20` }}
                                  />
                                ) : (
                                  <div
                                    className="flex h-16 w-16 items-center justify-center rounded-sm text-gray-300"
                                    style={{ border: `1px solid ${PRIMARY}20`, background: `${PRIMARY}06` }}
                                  >
                                    <FiPackage className="h-6 w-6" />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-bold text-gray-800 line-clamp-2">
                                      {v?.product?.name || "পণ্য"}
                                    </h4>
                                    {attrLabel && (
                                      <div className="mt-1">
                                        <span
                                          className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] font-semibold"
                                          style={{ border: `1px solid ${PRIMARY}30`, background: `${PRIMARY}10`, color: PRIMARY }}
                                        >
                                          <FiTag className="h-3 w-3" />
                                          {attrLabel}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-lg font-extrabold tracking-tight text-red-600 tabular-nums">
                                      ৳{itemTotal}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                                  <span className="font-semibold text-gray-500">
                                    ৳{v?.price}/unit
                                  </span>
                                  <span className="text-gray-300">•</span>
                                  <span className="flex items-center gap-1 text-gray-500">
                                    Qty: {cartItem.quantity}
                                  </span>
                                </div>
                                <div className="mt-2 flex items-center justify-between border-t pt-2" style={{ borderColor: `${PRIMARY}15` }}>
                                  <span
                                    className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-[10px] font-semibold"
                                    style={{ border: `1px solid #d1fae5`, background: '#ecfdf5', color: '#065f46' }}
                                  >
                                    <span className="h-1.5 w-1.5 rounded-sm bg-emerald-500" />
                                    স্টকে আছে
                                  </span>
                                  <button className="flex h-7 w-7 items-center justify-center rounded-sm text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500">
                                    <FiX className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-sm">
                          <span>সাবটোটাল</span>
                          <span className="font-bold">
                            ৳
                            {cartData.items.reduce(
                              (sum: number, ci: any) =>
                                selectedCartItems.has(ci.variant?.id)
                                  ? sum +
                                    (ci.variant?.price || 0) *
                                      ci.quantity
                                  : sum,
                              0,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span>ডেলিভারি চার্জ</span>
                          <span className="font-bold text-red-600">
                            {isFreeDelivery
                              ? "ফ্রি"
                              : `৳${deliveryCharge}`}
                          </span>
                        </div>
                        {appliedDiscount > 0 && (
                          <div className="flex justify-between text-sm mt-1 text-red-600">
                            <span>ছাড় (কুপন)</span>
                            <span>- ৳{appliedDiscount}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-black mt-3 pt-2 border-t">
                          <span>সর্বমোট</span>
                          <span className="text-red-600">
                            ৳
                            {cartData.items.reduce(
                              (sum: number, ci: any) =>
                                selectedCartItems.has(ci.variant?.id)
                                  ? sum +
                                    (ci.variant?.price || 0) *
                                      ci.quantity
                                  : sum,
                              0,
                            ) +
                              (isFreeDelivery ? 0 : deliveryCharge) -
                              appliedDiscount}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : selectedVariant ? (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        {selectedVariant.image && (
                          <img
                            src={selectedVariant.image}
                            alt=""
                            className="w-16 h-16 object-cover rounded-sm border border-gray-100"
                          />
                        )}
                        <div>
                          <div className="font-bold text-gray-800">
                            {selectedProduct?.name || data.product?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {Object.values(selectedVariantAttrs).join(" / ")}
                          </div>
                          <div className="text-lg font-black text-red-600">
                            ৳{selectedVariant.price}
                          </div>
                          {selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
                            <div className="text-xs text-gray-400 line-through">৳{selectedVariant.compareAtPrice}</div>
                          )}
                          <div className="text-xs text-gray-500">স্টক: {selectedVariant.stock} · SKU: {selectedVariant.sku}</div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>পরিমাণ</span>
                        <span className="font-bold">{quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>মূল্য</span>
                        <span className="font-bold">
                          ৳{(selectedVariant.price * quantity).toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>ডেলিভারি চার্জ</span>
                        <span className="font-bold text-red-600">
                          {isFreeDelivery ? "ফ্রি" : `৳${deliveryCharge}`}
                        </span>
                      </div>
                      {appliedDiscount > 0 && (
                        <div className="flex justify-between text-sm text-red-600">
                          <span>ছাড় (কুপন)</span>
                          <span>- ৳{appliedDiscount}</span>
                        </div>
                      )}
                      <div className="border-t pt-3 mt-2">
                        <div className="flex justify-between text-lg font-black">
                          <span>সর্বমোট</span>
                          <span className="text-red-600">
                            ৳{(selectedVariant.price * quantity + (isFreeDelivery ? 0 : deliveryCharge) - appliedDiscount).toFixed(0)}
                          </span>
                        </div>
                        {!isFreeDelivery && (
                          <div className="text-xs text-center mt-2 text-red-600 bg-white p-2 rounded-sm">
                            🎁 আজই অর্ডার করুন, ফ্রি ডেলিভারি পান!
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <FaShoppingCart className="text-3xl mx-auto mb-2" />
                      <p>সাইজ ও কালার সিলেক্ট করুন</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {!reviewsLoading && (
        <AnimSection delay={120}>
          <ReviewsSection
            reviews={reviews}
            reviewsLoading={reviewsLoading}
            avgRating={avgRating}
            showReviewForm={showReviewForm}
            setShowReviewForm={setShowReviewForm}
            editingReviewId={editingReviewId}
            reviewName={reviewName}
            reviewLocation={reviewLocation}
            reviewText={reviewText}
            reviewStars={reviewStars}
            reviewPhone={reviewPhone}
            reviewSubmitting={reviewSubmitting}
            setEditingReviewId={setEditingReviewId}
            setReviewName={setReviewName}
            setReviewLocation={setReviewLocation}
            setReviewText={setReviewText}
            setReviewStars={setReviewStars}
            setReviewPhone={setReviewPhone}
            onReviewSubmit={handleReviewSubmit}
            onEditReview={handleEditReview}
            onDeleteReview={handleDeleteReview}
            primary={PRIMARY}
          />
        </AnimSection>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <AnimSection delay={140}>
          <FAQSection
            faqs={faqs}
            openFaq={openFaq}
            setOpenFaq={setOpenFaq}
            primary={PRIMARY}
          />
        </AnimSection>
      )}

      {/* Contact */}
      <AnimSection delay={180}>
        <ContactSection
          displayPhone={displayPhone}
          displayPhone2={displayPhone2}
          displayEmail={displayEmail}
          displayAddress={displayAddress}
          displaySocialLinks={displaySocialLinks}
          whatsappNumber={whatsappNumber}
          primary={PRIMARY}
        />
      </AnimSection>
    </div>
  )}
</div>

      <StoreFooter
        companyName={companyName}
        intro="আমাদের অনলাইন দোকানে স্বাগতম"
        phone={displayPhone}
        email={displayEmail}
        address={displayAddress}
      />

      <WishlistDrawer
        open={wishlistDrawerOpen}
        onClose={() => setWishlistDrawerOpen(false)}
        wishlistData={wishlistData}
        wishlistLoading={wishlistLoading}
        addToCart={addToCart}
        toggleWishlist={toggleWishlist}
        scrollToOrder={scrollToOrder}
        primary={PRIMARY}
      />

      <CartDrawer
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartData={cartData}
        cartCount={cartCount}
        updateCartQty={updateCartQty}
        removeFromCart={removeFromCart}
        setIsCartOrder={setIsCartOrder}
        setSelectedCartItems={setSelectedCartItems}
        scrollToOrder={scrollToOrder}

        onInitiateCheckout={initiateCheckout}
        primary={PRIMARY}
        storeSlug={storeSlug}
      />

      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 rounded-sm"
        style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}
      >
        <div className="flex items-stretch">
        <div className="flex-1 px-4 py-2.5">
          {selectedVariant && selectedVariant.isPreOrder || selectedVariant && selectedVariant.stock > 0 ? (
            <>
              <div className="text-[10px] text-gray-500 truncate">
                {selectedProduct?.name || data.product?.name} —{" "}
                {selectedVariant && selectedVariant.isPreOrder ? <span className="text-amber-600 font-semibold">প্রি-অর্ডার</span> : Object.keys(selectedVariantAttrs).length > 0 ? Object.values(selectedVariantAttrs).join(" / ") : formatVariantAttrs(selectedVariant?.attributes)}
              </div>
                <div className="font-black text-lg text-red-600">
                  ৳{selectedVariant.price.toFixed(0)}
                </div>
              </>
            ) : (
              <div className="text-xs text-gray-400 py-2">
                সাইজ ও কালার সিলেক্ট করুন
              </div>
            )}
          </div>
          <a
            href={selectedVariant && selectedVariant.stock > 0 ? whatsappVariantLink(Object.values(selectedVariantAttrs).join(" / ")) : undefined}
            aria-disabled={!selectedVariant || selectedVariant.stock <= 0}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-1.5 text-white font-bold py-3.5 px-4 text-xs rounded-sm ${!selectedVariant || selectedVariant.stock <= 0 ? "opacity-50 pointer-events-none" : ""}`}
            style={{ background: "#25D366" }}
          >
            <FaWhatsapp className="text-sm" /> WhatsApp
          </a>
          <a
            href={selectedVariant && selectedVariant.stock > 0 ? orderNowLink : undefined}
            onClick={() => {
              if (selectedVariant && selectedVariant.stock > 0 && selectedProduct?.id) {
                initiateCheckout([{ productId: selectedProduct.id, quantity }]);
              }
            }}
            aria-disabled={!selectedVariant || selectedVariant.stock <= 0}
            className="flex items-center justify-center gap-1.5 text-white font-black py-3.5 px-4 text-xs"
            style={{ background: PRIMARY, borderRadius: "10px" }}
          >
            <FaShoppingCart className="text-sm" /> অর্ডার
          </a>
        </div>
      </div>
      <div className="h-16 md:hidden" />

      <div className="hidden md:flex fixed bottom-8 right-8 flex-col gap-3 z-50">
        {[
          {
            href: `https://wa.me/${whatsappNumber}`,
            icon: <FaWhatsapp className="text-xl" />,
            bg: "#25D366",
            shadow: "rgba(37,211,102,0.35)",
          },
          {
            href: `tel:${displayPhone}`,
            icon: <FaPhoneAlt className="text-base" />,
            bg: PRIMARY,
            shadow: "rgba(249,115,22,0.35)",
          },
          {
            onClick: () => setCartDrawerOpen(true),
            icon: <FaShoppingCart className="text-base" />,
            bg: PRIMARY,
            shadow: "rgba(249,115,22,0.35)",
          },
        ].map((btn: any, i) =>
          btn.href ? (
            <a
              key={i}
              href={btn.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-[52px] h-[52px] flex items-center justify-center text-white hover:scale-110 hover:-translate-y-0.5 transition-all rounded-sm floating-btn`}
              style={{
                background: btn.bg,
                boxShadow: `0 6px 20px ${btn.shadow}`,
              }}
            >
              {btn.icon}
            </a>
          ) : (
            <button
              key={i}
              onClick={btn.onClick}
              className={`w-[52px] h-[52px] flex items-center justify-center text-white hover:scale-110 hover:-translate-y-0.5 transition-all rounded-sm floating-btn`}
              style={{
                background: btn.bg,
                boxShadow: `0 6px 20px ${btn.shadow}`,
              }}
            >
              {btn.icon}
            </button>
          ),
        )}
      </div>

      {showTerms && termsContent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl rounded-sm">
            <div className="sticky top-0 bg-white flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-base font-black text-gray-800">শর্তাবলী</h2>
              <button
                onClick={() => setShowTerms(false)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-lg font-black transition-colors rounded-sm"
              >
                ×
              </button>
            </div>
            <div className="p-5 text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {termsContent}
            </div>
            <div className="p-5 border-t border-gray-100">
              <button
                onClick={() => setShowTerms(false)}
                className="w-full text-white font-black py-3 transition-all hover:opacity-90 shadow-sm rounded-sm"
                style={{ background: PRIMARY }}
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

        {marketingConsent === null && (
          <aside aria-label="Marketing cookie consent" className="fixed inset-x-0 bottom-0 z-[70] border-t border-gray-200 bg-white p-4 shadow-2xl md:bottom-4 md:left-4 md:right-auto md:max-w-lg md:rounded-xl md:border">
            <p className="text-sm font-bold text-gray-900">আপনার মার্কেটিং কুকির পছন্দ</p>
            <p className="mt-1 text-xs leading-5 text-gray-600">
              আপনার সম্মতি থাকলে এই দোকান Meta Pixel ও Conversions API ব্যবহার করে মার্কেটিং ইভেন্ট মাপবে। সম্মতি না দিলে কোনো Meta tracking চালু হবে না।
            </p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => saveMarketingConsent(false)} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                প্রত্যাখ্যান
              </button>
              <button type="button" onClick={() => saveMarketingConsent(true)} className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700">
                সম্মতি দিন
              </button>
            </div>
          </aside>
        )}
      </div>
    );
}
