'use client';

// Existing grocery theme is already the default in [slug]/page.tsx
// This component re-exports the same data interface for lazy loading
// The actual rendering is handled by the default [slug] page

import { useEffect } from 'react';

// This component is used as a pass-through for the grocery theme
// The actual grocery theme rendering is done by the main [slug] page
export default function GroceryTheme({ data }: { data?: any }) {
  // This component is lazy-loaded but returns null since
  // the main page already handles the 'grocery' theme natively
  useEffect(() => {
    // redirect to the main page handler by scrolling to top
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-sm h-10 w-10 border-2 border-red-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Loading store...</p>
      </div>
    </div>
  );
}