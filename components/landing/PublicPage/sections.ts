export const LANDING_SECTIONS = [
  { id: "features", label: "ফিচার" },
  { id: "stores", label: "লাইভ স্টোর" },
  { id: "demo", label: "ডেমো" },
  { id: "steps", label: "ধাপ" },
  { id: "pricing", label: "প্যাকেজ" },
  { id: "why", label: "কেন আমরা" },
  { id: "faq", label: "প্রশ্ন" },
] as const;

export type LandingSectionId = (typeof LANDING_SECTIONS)[number]["id"];

export const LANDING_DOCK_HEIGHT = 48;
