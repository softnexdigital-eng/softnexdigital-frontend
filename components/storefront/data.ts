export interface NavCategory {
  id: string;
  label: string;
  href: string;
}

export interface Slide {
  id: string;
  image: string;
  alt: string;
  href?: string;
}

export interface Banner {
  id: string;
  image: string;
  alt: string;
  href: string;
}

export interface ShopCategory {
  id: string;
  label: string;
  image: string;
  href: string;
}

export const defaultNavCategories: NavCategory[] = [
  { id: "honey", label: "Honey", href: "#honey" },
  { id: "dry-food", label: "Dry Food", href: "#dry-food" },
  { id: "mix-food", label: "Mix Food", href: "#mix-food" },
  { id: "nuts-seeds", label: "Nuts & Seeds", href: "#nuts-seeds" },
  { id: "pickle", label: "Pickle (আচার)", href: "#pickle" },
  { id: "dates", label: "Dates (খেজুর)", href: "#dates" },
  { id: "masala", label: "Masala (মসলা কম্বো)", href: "#masala" },
  { id: "tea", label: "Tea", href: "#tea" },
];

export const defaultSlides: Slide[] = [
  {
    id: "slide-1",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80",
    alt: "Fresh grocery selection",
    href: "#",
  },
  {
    id: "slide-2",
    image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=1400&q=80",
    alt: "Organic food products",
    href: "#",
  },
  {
    id: "slide-3",
    image: "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1400&q=80",
    alt: "Healthy pantry essentials",
    href: "#",
  },
];

export const defaultBanners: Banner[] = [
  {
    id: "banner-1",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=80",
    alt: "Premium honey offer",
    href: "#",
  },
  {
    id: "banner-2",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=80",
    alt: "Spices and masala collection",
    href: "#",
  },
];

export const defaultShopCategories: ShopCategory[] = [
  {
    id: "dates",
    label: "Dates (খেজুর)",
    image: "https://images.unsplash.com/photo-1593904308078-4704a4b0d8d3?auto=format&fit=crop&w=300&q=80",
    href: "#dates",
  },
  {
    id: "dry-food",
    label: "Dry Food",
    image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=300&q=80",
    href: "#dry-food",
  },
  {
    id: "falaq-food",
    label: "Falaq Food...",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=300&q=80",
    href: "#falaq-food",
  },
  {
    id: "honey",
    label: "Honey",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=300&q=80",
    href: "#honey",
  },
  {
    id: "mix-food",
    label: "Mix Food",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80",
    href: "#mix-food",
  },
  {
    id: "nuts-seeds",
    label: "Nuts & Seeds",
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=300&q=80",
    href: "#nuts-seeds",
  },
  {
    id: "tea",
    label: "Tea",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=300&q=80",
    href: "#tea",
  },
];
