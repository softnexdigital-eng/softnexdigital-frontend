"use client";

export default function ElectronicsThemeDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 text-white flex items-center justify-center">
      <div className="text-center max-w-lg px-6">
        <div className="text-6xl mb-6">⚡</div>
        <h1 className="text-4xl font-black mb-4">TechStore</h1>
        <p className="text-lg text-cyan-100 mb-8">
          Premium Electronics Landing Page — Cyan & Blue Theme
        </p>
        <div className="inline-block bg-white/10 backdrop-blur-sm rounded-sm p-6 mb-8 border border-white/20">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-bold">৳999</span>
            <span className="text-cyan-200">one-time payment</span>
          </div>
          <div className="text-sm text-cyan-200">Launch your electronics store today</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-left">
          {[
            "Product Variants & Inventory",
            "Order Management System",
            "Customer Management",
            "Return Management",
            "Attribute Templates",
            "Landing Page Builder",
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm bg-white/5 rounded-lg px-4 py-3">
              <span>✓</span> {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}