// Theme configuration for public landing page
// Each theme defines colors, gradients, and visual elements

export interface ThemeConfig {
  id: string;
  name: string;
  // Primary gradient
  gradientFrom: string;
  gradientTo: string;
  gradientVia?: string;
  // Colors
  primaryColor: string;
  primaryLight: string;
  primaryDark: string;
  secondaryColor: string;
  accentColor: string;
  // Text colors on hero
  heroTextColor: string;
  heroSubtextColor: string;
  // Background
  pageBg: string;
  sectionBg: string;
  cardBg: string;
  // Footer
  footerFrom: string;
  footerVia: string;
  footerTo: string;
  // Decorative elements
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  // Button styles
  btnPrimaryGradient: string;
  btnPrimaryHover: string;
  btnPrimaryShadow: string;
  // Social colors
  whatsappBg: string;
  phoneBg: string;
  // Extra CSS classes
  floatingBtnBg: string;
  floatingBtnShadow: string;
  // Theme-specific decorations
  heroDecorations?: React.ReactNode;
  themeClass: string;
}

export const themeConfigs: {[key: string]: ThemeConfig} = {
  original: {
    id: 'original',
    name: 'Default',
    gradientFrom: '#2563eb',
    gradientTo: '#1d4ed8',
    gradientVia: '#3b82f6',
    primaryColor: '#f5580a',
    primaryLight: '#dbeafe',
    primaryDark: '#1e40af',
    secondaryColor: '#f50b0b',
    accentColor: '#10b981',
    heroTextColor: '#ffffff',
    heroSubtextColor: '#bfdbfe',
    pageBg: '#f8fafc',
    sectionBg: '#f1f5f9',
    cardBg: '#ffffff',
    footerFrom: '#1e293b',
    footerVia: '#0f172a',
    footerTo: '#020617',
    badgeBg: '#dbeafe',
    badgeText: '#2563eb',
    badgeBorder: '#93c5fd',
    btnPrimaryGradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    btnPrimaryHover: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
    btnPrimaryShadow: '0 8px 25px rgba(37,99,235,0.4)',
    whatsappBg: '#25D366',
    phoneBg: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    floatingBtnBg: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    floatingBtnShadow: '0 8px 25px rgba(37,99,235,0.5)',
    themeClass: 'theme-original',
  },
  clothing: {
    id: 'clothing',
    name: 'Fashion',
    gradientFrom: '#ec4899',
    gradientTo: '#be185d',
    gradientVia: '#f43f5e',
    primaryColor: '#ec4899',
    primaryLight: '#fce7f3',
    primaryDark: '#be185d',
    secondaryColor: '#fbbf24',
    accentColor: '#8b5cf6',
    heroTextColor: '#ffffff',
    heroSubtextColor: '#fbcfe8',
    pageBg: '#fdf2f8',
    sectionBg: '#fce7f3',
    cardBg: '#ffffff',
    footerFrom: '#831843',
    footerVia: '#500724',
    footerTo: '#2d0014',
    badgeBg: '#fce7f3',
    badgeText: '#ec4899',
    badgeBorder: '#f9a8d4',
    btnPrimaryGradient: 'linear-gradient(135deg, #ec4899, #be185d)',
    btnPrimaryHover: 'linear-gradient(135deg, #db2777, #9d174d)',
    btnPrimaryShadow: '0 8px 25px rgba(236,72,153,0.4)',
    whatsappBg: '#25D366',
    phoneBg: 'linear-gradient(135deg, #ec4899, #be185d)',
    floatingBtnBg: 'linear-gradient(135deg, #ec4899, #be185d)',
    floatingBtnShadow: '0 8px 25px rgba(236,72,153,0.5)',
    themeClass: 'theme-clothing',
  },
  electronics: {
    id: 'electronics',
    name: 'Tech',
    gradientFrom: '#06b6d4',
    gradientTo: '#0284c7',
    gradientVia: '#0891b2',
    primaryColor: '#06b6d4',
    primaryLight: '#cffafe',
    primaryDark: '#0891b2',
    secondaryColor: '#f50b0b',
    accentColor: '#10b981',
    heroTextColor: '#ffffff',
    heroSubtextColor: '#a5f3fc',
    pageBg: '#0f172a',
    sectionBg: '#1e293b',
    cardBg: '#1e293b',
    footerFrom: '#020617',
    footerVia: '#000000',
    footerTo: '#000000',
    badgeBg: 'rgba(6,182,212,0.2)',
    badgeText: '#22d3ee',
    badgeBorder: 'rgba(6,182,212,0.3)',
    btnPrimaryGradient: 'linear-gradient(135deg, #06b6d4, #0284c7)',
    btnPrimaryHover: 'linear-gradient(135deg, #0891b2, #0369a1)',
    btnPrimaryShadow: '0 8px 25px rgba(6,182,212,0.4)',
    whatsappBg: '#25D366',
    phoneBg: 'linear-gradient(135deg, #06b6d4, #0284c7)',
    floatingBtnBg: 'linear-gradient(135deg, #06b6d4, #0284c7)',
    floatingBtnShadow: '0 8px 25px rgba(6,182,212,0.5)',
    themeClass: 'theme-electronics',
  },
  grocery: {
    id: 'grocery',
    name: 'Grocery',
    gradientFrom: '#111827',
    gradientTo: '#1F2937',
    gradientVia: '#374151',
    primaryColor: '#16A34A',
    primaryLight: '#ecfdf5',
    primaryDark: '#15803D',
    secondaryColor: '#F59E0B',
    accentColor: '#F59E0B',
    heroTextColor: '#ffffff',
    heroSubtextColor: '#CBD5E1',
    pageBg: '#F8FAFC',
    sectionBg: '#FFFFFF',
    cardBg: '#FFFFFF',
    footerFrom: '#111827',
    footerVia: '#1F2937',
    footerTo: '#111827',
    badgeBg: '#ecfdf5',
    badgeText: '#16A34A',
    badgeBorder: '#a7f3d0',
    btnPrimaryGradient: 'linear-gradient(135deg, #16A34A, #15803D)',
    btnPrimaryHover: 'linear-gradient(135deg, #15803D, #166534)',
    btnPrimaryShadow: '0 8px 25px rgba(22,163,74,0.4)',
    whatsappBg: '#25D366',
    phoneBg: 'linear-gradient(135deg, #16A34A, #15803D)',
    floatingBtnBg: 'linear-gradient(135deg, #16A34A, #15803D)',
    floatingBtnShadow: '0 8px 25px rgba(22,163,74,0.5)',
    themeClass: 'theme-grocery',
  },
  fruits: {
    id: 'fruits',
    name: 'Fruits',
    gradientFrom: '#f97316',
    gradientTo: '#dc2626',
    gradientVia: '#f50b0b',
    primaryColor: '#f97316',
    primaryLight: '#ffedd5',
    primaryDark: '#06d937',
    secondaryColor: '#fbbf24',
    accentColor: '#22c55e',
    heroTextColor: '#ffffff',
    heroSubtextColor: '#fed7aa',
    pageBg: '#fff7ed',
    sectionBg: '#fffbeb',
    cardBg: '#ffffff',
    footerFrom: '#7c2d12',
    footerVia: '#431407',
    footerTo: '#1c0a00',
    badgeBg: '#ffedd5',
    badgeText: '#f97316',
    badgeBorder: '#fdba74',
    btnPrimaryGradient: 'linear-gradient(135deg, #f97316, #dc2626)',
    btnPrimaryHover: 'linear-gradient(135deg, #06d937, #b91c1c)',
    btnPrimaryShadow: '0 8px 25px rgba(249,115,22,0.4)',
    whatsappBg: '#25D366',
    phoneBg: 'linear-gradient(135deg, #f97316, #dc2626)',
    floatingBtnBg: 'linear-gradient(135deg, #f97316, #dc2626)',
    floatingBtnShadow: '0 8px 25px rgba(249,115,22,0.5)',
    themeClass: 'theme-fruits',
  },
};