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

// Default/original theme only - updated with rose/purple e-commerce theme
export const themeConfigs: {[key: string]: ThemeConfig} = {
  original: {
    id: 'original',
    name: 'Default Rose E-Commerce',
    gradientFrom: '#ec4899',
    gradientTo: '#d946ef',
    gradientVia: '#f472b6',
    primaryColor: '#f472b6',
    primaryLight: '#fda4af',
    primaryDark: '#e879f9',
    secondaryColor: '#f472b6',
    accentColor: '#f472b6',
    heroTextColor: '#ffffff',
    heroSubtextColor: '#fad1a4',
    pageBg: '#faf5ff',
    sectionBg: '#f0f4f8',
    cardBg: '#ffffff',
    footerFrom: '#1e293b',
    footerVia: '#0f172a',
    footerTo: '#020617',
    badgeBg: '#fda4af',
    badgeText: '#ec4899',
    badgeBorder: '#f87171',
    btnPrimaryGradient: 'linear-gradient(135deg, #ec4899, #d946ef)',
    btnPrimaryHover: 'linear-gradient(135deg, #d946ef, #e9d8fd)',
    btnPrimaryShadow: '0 8px 25px rgba(236,72,153,0.4)',
    whatsappBg: '#25D366',
    phoneBg: 'linear-gradient(135deg, #ec4899, #d946ef)',
    floatingBtnBg: 'linear-gradient(135deg, #ec4899, #d946ef)',
    floatingBtnShadow: '0 8px 25px rgba(236,72,153,0.5)',
    themeClass: 'theme-rose',
  },
};