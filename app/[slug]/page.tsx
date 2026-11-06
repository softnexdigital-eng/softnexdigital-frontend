"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useThrottledCounter } from "@/lib/performance";
import { useParams } from "next/navigation";
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
import Footer from "@/components/landing/page/Footer";
import WishlistDrawer from "@/components/landing/page/WishlistDrawer";
import CartDrawer from "@/components/landing/page/CartDrawer";
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

function BannerSlider({ 
  banners, 
  onBannerClick 
}: { 
  banners?: BannerItem[]; 
  onBannerClick?: (banner: BannerItem) => void;
}) {
  const [current, setCurrent] = useState(0);
  const total = banners?.length || 0;

  useEffect(() => {
    if (total === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 4000);
    return () => clearInterval(timer);
  }, [total]);

    // যদি কোন ব্যানার না থাকে, ডামি ব্যানার দেখান
  const bannerList: BannerItem[] = [...(total > 0 && banners ? banners : [
    {
      id: "dummy-1",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
      title: "Summer Sale",
      description: "Up to 50% off on electronics"
    },
    {
      id: "dummy-2", 
      imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
      title: "New Arrivals",
      description: "Check out our latest products"
    },
    {
      id: "dummy-3",
      imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
      title: "Best Deals",
      description: "Amazing offers every day"
    },
  ])];

  const handleBannerClick = (banner: BannerItem, idx: number) => {
    // Only allow click on real banners (not dummy ones)
    if (banner.id.startsWith("dummy-")) return;
    if (onBannerClick) onBannerClick(banner);
  };

  return (
    <div className="relative w-full h-66 md:h-80 lg:h-[520px] overflow-hidden" style={{ borderRadius: "14px" }}>
      {/* Premium Dark Gradient Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(165deg, #111827 0%, #1F2937 50%, #374151 100%)' }}>
        {/* Subtle radial lighting effect */}
        <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.3) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)' }}></div>
        
        {/* Glass morphism decorative elements */}
        <div className="absolute top-16 right-24 w-24 h-24 backdrop-blur-sm rounded-2xl transform rotate-12 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}></div>
        <div className="absolute top-32 right-48 w-16 h-16 backdrop-blur-sm rounded-2xl transform -rotate-6 border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}></div>
        <div className="absolute bottom-24 right-32 w-20 h-20 backdrop-blur-sm rounded-2xl transform rotate-45 border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}></div>
        <div className="absolute bottom-16 right-16 w-14 h-14 backdrop-blur-sm rounded-2xl transform -rotate-12 border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}></div>
      </div>

      {/* Banner slides */}
      {bannerList.map((banner, idx) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            idx === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={banner.imageUrl}
            alt={banner.title || `Banner ${idx + 1}`}
            className="w-full h-full object-cover"
          />
          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }}></div>
        </div>
      ))}

      {/* Hero Content Overlay */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              {bannerList[current].title || "Premium Collection"}
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-6" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
              {bannerList[current].description || "Discover our premium selection today"}
            </p>
            <button className="text-white font-bold px-8 py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105" style={{ background: '#F59E0B', borderRadius: '10px' }}>
              Shop Now →
            </button>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {bannerList.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2.5 h-2.5 transition-all ${
              idx === current ? "bg-white w-6" : "bg-white/40"
            }`}
            style={{ borderRadius: "4px" }}
          />
        ))}
      </div>
    </div>
  );
}

export default function PublicLandingPage() {
  const params = useParams();
  const [data, setData] = useState<PublicPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variantProductMap, setVariantProductMap] = useState<{
    [key: string]: Product;
  }>({});
  const [sessionId, setSessionId] = useState<string>("");
  const [cartCount, setCartCount] = useState(0);

  const [quantity, setQuantity] = useState(1);
  const QUANTITY_STEP = 0.5;
  const roundToStep = (val: number) =>
    Math.round(val / QUANTITY_STEP) * QUANTITY_STEP;
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

  // ভিউ মোড – হোম বা ডিটেইল
  const [viewMode, setViewMode] = useState<"home" | "detail">("home");

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
    if (!variants.length) {
      setCartItemVariants({});
      return;
    }
    const map: { [key: string]: any[] } = {};
    variants.forEach((v: any) => {
      const pid = v.product?.id || v.productId;
      if (!pid) return;
      if (!map[pid]) map[pid] = [];
      map[pid].push(v);
    });
    setCartItemVariants(map);
  }, [variants]);

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
  } = useForm<OrderFormData>();

  const debouncedSearch = useDebounce(searchQuery, 300);

  const getProductForVariant = useCallback(
    (variantId: string): Product | null => {
      if (!data) return null;
      const allProds = data.products || [];
      for (const prod of allProds) {
        if (prod.variants?.some((v: any) => v.id === variantId)) return prod;
      }
      if (data.product?.variants?.some((v: any) => v.id === variantId))
        return data.product;
      return null;
    },
    [data],
  );

  const fuse = useMemo(() => {
    if (!variants.length || !data?.product) return null;
    const items = variants.map((v) => ({
      id: v.id,
      name: data.product!.name,
      attributes: Object.values(v.attributes).join(" "),
      price: v.price,
      variant: v,
    }));
    return new Fuse(items, {
      keys: ["name", "attributes", "price"],
      threshold: 0.3,
      includeScore: true,
    });
  }, [variants, data?.product]);

  const filteredVariants = useMemo(() => {
    let results = [...variants];
    if (debouncedSearch.trim() && fuse) {
      const fuseResults = fuse.search(debouncedSearch);
      results = fuseResults.map((r) => r.item.variant);
    }
    if (selectedCategory) {
      results = results.filter((v) => {
        const product = variantProductMap[v.id];
        if (!product || !product.categories) return false;
        return product.categories.some(
          (pc: any) => pc.category?.id === selectedCategory,
        );
      });
    }
    if (selectedSubcategory) {
      results = results.filter((v) => {
        const product = variantProductMap[v.id];
        if (!product || !product.categories) return false;
        return product.categories.some((pc: any) => {
          const cat = pc.category;
          if (!cat) return false;
          const subCats =
            ((data?.categories?.length ? data.categories : []) as any[]).find(
              (c: any) => c.id === cat.id,
            )?.subcategories || [];
          return subCats.some((sc: any) => sc.id === selectedSubcategory);
        });
      });
    }
    if (selectedBrand) {
      results = results.filter((v) => {
        const product = variantProductMap[v.id];
        if (!product || !product.brand) return false;
        return product.brand.id === selectedBrand;
      });
    }
    if (priceMin) {
      const min = parseFloat(priceMin);
      results = results.filter((v) => v.price >= min);
    }
    if (priceMax) {
      const max = parseFloat(priceMax);
      results = results.filter((v) => v.price <= max);
    }
    if (sortBy === "price_asc") results.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") results.sort((a, b) => b.price - a.price);
    else if (sortBy === "oldest")
      results.sort((a, b) => (a.id > b.id ? 1 : -1));
    else if (sortBy === "newest")
      results.sort((a, b) => (a.id < b.id ? 1 : -1));
    return results;
  }, [
    debouncedSearch,
    fuse,
    variants,
    priceMin,
    priceMax,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    sortBy,
    variantProductMap,
    data,
  ]);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || !fuse) return [];
    return fuse
      .search(searchQuery)
      .slice(0, 5)
      .map((r) => r.item.variant);
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
        fetchCartData();
      }
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || "কার্টে যোগ করতে ব্যর্থ");
    } finally {
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
      const response = await api.get(`/public/landing-page/${params.slug}`);
      if (response.data.success) {
        setData(response.data.data);

        const allProducts = response.data.data.products || [];
        const allVariants: Variant[] = [];
        const vpm: { [key: string]: Product } = {};

        allProducts.forEach((p: Product) => {
          if (p.variants && Array.isArray(p.variants)) {
            p.variants.forEach((v: Variant) => {
              allVariants.push(v);
              vpm[v.id] = p;
            });
          }
        });

        if (allVariants.length === 0 && response.data.data.product?.variants) {
          const mainProduct = response.data.data.product;
          response.data.data.product.variants.forEach((v: Variant) => {
            allVariants.push(v);
            vpm[v.id] = mainProduct;
          });
        }

        setVariants(allVariants);
        setVariantProductMap(vpm);

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
  }, [params.slug]);

  useEffect(() => {
    fetchData();
    api.post(`/public/page-view/${params.slug}`).catch(() => {});
  }, [fetchData, params.slug]);

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
    if (!selectedVariant || selectedVariant.stock <= 0) {
      showToast.error(selectedVariant ? "এই ভ্যারিয়েন্টটি স্টকে নেই" : "সাইজ ও কালার সিলেক্ট করুন");
      return;
    }
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
      });
      if (response.data.success) {
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
      });
      if (response.data.success) {
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

  const scrollToOrder = () =>
    document
      .getElementById("order-form")
      ?.scrollIntoView({ behavior: "smooth" });

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

  // স্পষ্টভাবে অ্যাট্রিবিউট বেছে নেওয়ার পর ভ্যারিয়েন্ট আপডেট (অ্যাট্রিবিউট অপরিবর্তিত রাখা হয়)
  const updateVariantAndProduct = useCallback(
    (variant: Variant) => {
      setSelectedVariant(variant);
      setQuantity(1);
      const product = getProductForVariant(variant.id);
      setSelectedProduct(product || data?.product || null);
      setViewMode("detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [getProductForVariant, data?.product],
  );

  const syncHeroVariant = useCallback(
    (variant: Variant | null, attributes: Record<string, string>) => {
      setSelectedVariant(variant);
      setSelectedVariantAttrs(attributes);
      if (variant) {
        const product = getProductForVariant(variant.id);
        setSelectedProduct(product || data?.product || null);
      }
    },
    [getProductForVariant, data?.product],
  );

  // হোমে ফেরার ফাংশন
  const goToHome = () => {
    setViewMode("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
                setSelectedVariant(variants[0] || null);
                setQuantity(1);
                setViewMode("home");
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
        background: "#FFFFFF",
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

      <div className="max-w-[1590px] mx-auto  sm:px-6 py-0.5">
        {/* ===== হোম মোড – BannerSlider + VariantsGrid + Reviews ===== */}
        {viewMode === "home" && (
          <>
            {/* Desktop: Categories Column (left) + Banner (right, narrower) */}
            <div className="flex gap-0 mt-0 mb-2">
              {/* Desktop Categories Column */}
              <DesktopSidebar
                categories={categories}
                brands={brands}
                variants={variants}
                selectedCategory={selectedCategory}
                selectedSubcategory={selectedSubcategory}
                selectedBrand={selectedBrand}
                expandedCategoryId={expandedCategoryId}
                expandedBrandId={expandedBrandId}
                selectedVariant={selectedVariant}
                variantProductMap={variantProductMap}
                productImage={productImage}
                data={data}
                filteredVariants={filteredVariants}
                priceMin={priceMin}
                priceMax={priceMax}
                onPriceMinChange={setPriceMin}
                onPriceMaxChange={setPriceMax}
                onSelectCategory={(id) => {
                  setSelectedCategory(id);
                  setSelectedSubcategory(null);
                }}
                onExpandCategory={(id) => setExpandedCategoryId(id)}
                onSelectSubcategory={(id) => setSelectedSubcategory(id)}
                onSelectBrand={(id) => setSelectedBrand(id)}
                onExpandBrand={(id) => setExpandedBrandId(id)}
                onUpdateVariant={updateVariantAndProduct}
                primary={PRIMARY}
              />

              {/* Banner - narrower on desktop */}
              <div className="flex-1 min-w-0 glow-border-wrap">
                <div className="glow-border-content">
                  <BannerSlider 
                    banners={data.banners} 
                onBannerClick={(banner) => {
                  if (banner.categoryId) {
                    setSelectedCategory(banner.categoryId);
                    setSelectedSubcategory(null);
                    setViewMode("home");
                  } else if (banner.linkUrl) {
                    window.open(banner.linkUrl, '_blank');
                  }
                }}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Category Grid (below Banner) - 3 columns, square boxes */}
           {categories.length > 0 && (
  <div className="lg:hidden mt-3 mb-1">
    {/* gap-px এবং bg-gray-200 ব্যবহার করা হয়েছে যাতে ভেতরে সুন্দর 1px বর্ডার তৈরি হয় */}
    <div className="grid grid-cols-3 gap-px bg-gray-200 border border-gray-200 rounded-md overflow-hidden">
      {categories.map((cat: any) => {
        const isActive = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => {
              const newSelected = selectedCategory === cat.id ? null : cat.id;
              setSelectedCategory(newSelected);
              setSelectedSubcategory(null);
            }}
            // aspect-square বাদ দিয়ে min-h-[72px] দেওয়া হয়েছে।
            // ট্যাপ করার সময় ব্লিংক বন্ধ করতে [-webkit-tap-highlight-color:transparent] দেওয়া হয়েছে।
            className={`flex flex-col items-center justify-center p-2 min-h-[72px] transition-colors duration-200 text-center outline-none [-webkit-tap-highlight-color:transparent] ${
              isActive
                ? "bg-red-50 text-red-600 font-semibold"
                : "bg-white text-gray-600 active:bg-gray-50"
            }`}
          >
            {/* টেক্সট সাইজ 13px করা হয়েছে */}
            <span className="text-[13px] leading-snug line-clamp-2 px-0.5">
              {cat.name}
            </span>
            
            {cat.count ? (
              <span 
                className={`text-[10px] mt-0.5 ${
                  isActive ? "text-red-400" : "text-gray-400"
                }`}
              >
                ({cat.count})
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  </div>
)}

            <AnimSection delay={90}>
              <VariantsGrid
                filteredVariants={filteredVariants}
                selectedVariant={selectedVariant}
                selectedProduct={selectedProduct}
                data={data}
                variantProductMap={variantProductMap}
                productImage={productImage}
                wishlistIds={wishlistIds}
                cartLoadingItems={cartLoadingItems}
                isOutOfStock={isOutOfStock}
                addToCart={addToCart}
                updateVariantAndProduct={updateVariantAndProduct}
                toggleWishlist={toggleWishlist}
                sortBy={sortBy}
                setSortBy={setSortBy}
                activeFiltersCount={activeFiltersCount}
                clearFilters={clearFilters}
                primary={PRIMARY}
                primaryDark={PRIMARY_DARK}
                primaryLight={PRIMARY_LIGHT}
                variantDetails={variantDetails}
                scrollToHero={scrollToHero}
                selectedCategory={selectedCategory}
                onSelectCategory={(id) => {
                  setSelectedCategory(id);
                  setSelectedSubcategory(null);
                }}
              />
            </AnimSection>

            {/* গ্রাহকের রিভিউ – VariantsGrid-এর নিচে */}
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
          </>
        )}

        {/* ===== ডিটেইল মোড – Hero + OrderForm + Reviews + FAQ + Contact ===== */}
        {viewMode === "detail" && (
          <>
            <div className="flex justify-start mb-4">
              <button
                onClick={goToHome}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-sm transition-colors"
              >
                <FaChevronLeft size={12} />
                পণ্যের তালিকায় ফিরে যান
              </button>
            </div>

            <AnimSection>
              <div id="hero-section">
                <HeroSection
                  selectedVariant={selectedVariant}
                  selectedProduct={selectedProduct}
                  data={data}
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

            <div className="relative" id="order-form">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
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
          </>
        )}
      </div>

      <Footer
        displayLogo={displayLogo}
        companyName={companyName}
        displayPhone={displayPhone}
        displayPhone2={displayPhone2}
        displayEmail={displayEmail}
        displayAddress={displayAddress}
        displaySocialLinks={displaySocialLinks}
        termsContent={termsContent}
        showTerms={showTerms}
        setShowTerms={setShowTerms}
        primary={PRIMARY}
        primaryDark={PRIMARY_DARK}
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
        setViewMode={setViewMode}
        primary={PRIMARY}
      />

      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 rounded-sm"
        style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}
      >
        <div className="flex items-stretch">
          <div className="flex-1 px-4 py-2.5">
            {selectedVariant && selectedVariant.stock > 0 ? (
              <>
                <div className="text-[10px] text-gray-500 truncate">
                  {selectedProduct?.name || data.product?.name} —{" "}
                  {Object.values(selectedVariantAttrs).join(" / ")}
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
    </div>
  );
}