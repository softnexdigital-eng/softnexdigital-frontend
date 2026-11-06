'use client';
import Link from 'next/link';
import { FiCheck, FiArrowRight, FiShoppingCart, FiPackage, FiUsers, FiRefreshCw, FiLayers, FiLayout } from 'react-icons/fi';

export default function FruitsTheme() {
  const features = [
    { icon: FiLayout, title: 'Fruits Landing Page', desc: 'Vibrant fruits-focused landing page with seasonal specials' },
    { icon: FiShoppingCart, title: 'Order Management', desc: 'Manage fresh orders, bulk fruit boxes, and delivery slots' },
    { icon: FiPackage, title: 'Inventory Management', desc: 'Track seasonal fruits, ripeness stages, and freshness stock' },
    { icon: FiUsers, title: 'Customer Management', desc: 'View preferences, subscription boxes, and repeat orders' },
    { icon: FiLayers, title: 'Variants & Attributes', desc: 'Support for weight, ripeness level, pack size variants' },
    { icon: FiRefreshCw, title: 'Return Management', desc: 'Handle fresh produce quality claims and replacements' },
  ];

  return (
    <div className="min-h-screen bg-white/30">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-red-100">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-red-600">FreshFruits</span>
              <span className="text-xs text-red-400 font-medium">Fruit Store</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/auth/login" className="text-red-500 hover:text-red-700 text-sm font-medium">Login</Link>
              <Link href="/auth/login" className="bg-gradient-to-r from-red-400 to-rose-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:from-red-500 hover:to-rose-600 transition-all shadow-md shadow-red-200">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-red-400 via-red-400 to-rose-400 text-white overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 text-8xl opacity-15">🍎</div>
          <div className="absolute top-20 right-20 text-6xl opacity-15">🍊</div>
          <div className="absolute bottom-20 left-20 text-6xl opacity-15">🍇</div>
          <div className="absolute -bottom-10 -right-10 text-8xl opacity-15">🍌</div>
          <div className="absolute top-1/2 left-1/3 text-5xl opacity-10">🍓</div>
        </div>
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-1.5 rounded-sm mb-4">🍎 Premium Fruit Store</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Launch Your <span className="text-red-500">Fresh Fruit</span> Business
            </h1>
            <p className="text-lg md:text-xl text-red-50 mb-8">
              Beautiful fruit store landing page with seasonal stock management, freshness tracking, and order scheduling.
              One-time payment — no monthly fees!
            </p>
            <div className="inline-block bg-white/15 backdrop-blur-sm rounded-sm p-6 md:p-8 mb-8 border border-white/30">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold">৳999</span>
                <span className="text-red-500">one-time payment</span>
              </div>
              <p className="text-red-50 text-sm">Pay via bKash and get your fruit store activated within 30 minutes</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/auth/login" className="bg-white text-red-600 px-8 py-3.5 rounded-sm font-semibold text-lg hover:bg-white transition-colors flex items-center gap-2 shadow-lg">
                Start Selling Fruits <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/auth/login" className="border-2 border-white/40 text-white px-8 py-3.5 rounded-sm font-semibold text-lg hover:bg-white/10 transition-colors">
                Login to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything for Your Fruit Store</h2>
            <p className="text-lg text-red-500/70 max-w-2xl mx-auto">Built specifically for fresh fruit businesses</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white/50 rounded-sm p-6 shadow-sm border border-red-100 hover:shadow-lg hover:border-red-200 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Start */}
      <section className="py-20 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Start Your Fruit Store</h2>
            <p className="text-lg text-gray-600">Simple 3-step process to activate your fresh fruit business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-sm flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Register</h3>
              <p className="text-gray-600 text-sm">Create your fruit store account with email verification</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-sm flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Pay ৳999</h3>
              <p className="text-gray-600 text-sm">Send payment to bKash 01918647966 and submit transaction ID</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-sm flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Go Live</h3>
              <p className="text-gray-600 text-sm">Admin verifies within 30 minutes, start selling fresh fruits!</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-50 border border-red-200 rounded-sm p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">💳 bKash Payment Details</h3>
              <p className="text-gray-600">Send exactly ৳999 to the bKash number below</p>
            </div>
            <div className="text-center mb-6">
              <div className="inline-block bg-white border-2 border-red-300 rounded-sm px-8 py-4">
                <p className="text-sm text-gray-500 mb-1">bKash Number</p>
                <p className="text-3xl font-bold text-gray-900 tracking-wider">01918647966</p>
              </div>
            </div>
            <div className="max-w-md mx-auto">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">After Payment:</h4>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Receive Transaction ID from bKash</li>
                <li>Login and submit the Transaction ID</li>
                <li>Admin verifies and activates within 30 min</li>
                <li>Get email notification once approved</li>
              </ol>
            </div>
            <div className="mt-6 text-center">
              <Link href="/auth/login" className="bg-gradient-to-r from-red-400 to-rose-500 text-white px-8 py-3 rounded-sm font-semibold text-lg hover:from-red-500 hover:to-rose-600 transition-all shadow-lg shadow-red-200 inline-block">
                Start Fruit Store — ৳999
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Affordable Pricing</h2>
            <p className="text-lg text-gray-600">One payment. No hidden fees. No monthly subscriptions.</p>
          </div>
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-sm shadow-lg border-2 border-red-400 overflow-hidden">
              <div className="bg-gradient-to-r from-red-400 to-rose-500 text-white text-center py-3 text-sm font-semibold">🍎 FRESH FRUIT PACKAGE</div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Fruit Store Bundle</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">৳999</span>
                  <span className="text-gray-500 ml-2">one-time</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Fruits Landing Page','Order & Delivery Mgmt','Freshness Inventory','Customer Profiles','Quality Replacements','Email Notifications','Lifetime Access','No Monthly Fees'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <FiCheck className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/login" className="w-full bg-gradient-to-r from-red-400 to-rose-500 text-white py-3.5 rounded-sm font-semibold text-lg hover:from-red-500 hover:to-rose-600 transition-all shadow-lg shadow-red-200 text-center block">
                  Start Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-red-950 text-white/60 py-12">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-red-500 text-lg font-bold mb-2">FreshFruits</h3>
            <p className="text-sm mb-4">Fruit store landing page solution for Bangladeshi fruit businesses</p>
            <div className="text-xs">
              <p>Payment: bKash 01918647966 | ৳999 one-time</p>
              <p className="mt-1">&copy; {new Date().getFullYear()} FreshFruits. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}