'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiTruck, FiCreditCard, FiMapPin } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import EcommerceHeader from '@/components/ecommerce/EcommerceHeader';
import EcommerceFooter from '@/components/ecommerce/EcommerceFooter';

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string } | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    notes: '',
  });

  useEffect(() => {
    if (items.length === 0 && !orderSuccess) {
      router.push('/cart');
    }
  }, [items, router, orderSuccess]);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await api.get('/addresses');
      if (res.data.success) {
        const data = res.data.data || [];
        setAddresses(data);
        const defaultAddr = data.find((a: Address) => a.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr.id);
      }
    } catch {
      // Silently handle error
    }
  }, []);

  const fetchShippingMethods = useCallback(async () => {
    try {
      const res = await api.get('/shipping-methods');
      if (res.data.success) {
        const methods = res.data.data || [];
        setShippingMethods(methods);
        if (methods.length > 0) setSelectedShipping(methods[0].id);
      }
    } catch {
      // Silently handle error
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      await fetchAddresses();
      if (mounted) await fetchShippingMethods();
    };
    load();
    return () => { mounted = false; };
  }, [fetchAddresses, fetchShippingMethods]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await api.post('/public/coupon/validate', {
        code: couponCode,
        subtotal: cartTotal,
      });
      if (res.data.success && res.data.valid) {
        setDiscount(res.data.data.discountAmount);
        setCouponApplied(true);
        showToast.success(`Coupon applied! You saved ৳${res.data.data.discountAmount.toFixed(0)}`);
      } else {
        showToast.error(res.data.message || 'Invalid coupon');
      }
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      showToast.error(axiosError.response?.data?.message || 'Invalid coupon');
    }
  };

  const deliveryCharge = shippingMethods.find(s => s.id === selectedShipping)?.price || 0;
  const total = Math.max(0, cartTotal + deliveryCharge - discount);

  const handlePlaceOrder = async () => {
    if (!formData.fullName || !formData.phone || !formData.addressLine1 || !formData.city) {
      showToast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const orderItems = items.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtTime: item.price,
      }));

      const res = await api.post('/public/orders', {
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerAddress: `${formData.addressLine1}, ${formData.addressLine2 ? formData.addressLine2 + ', ' : ''}${formData.city}${formData.postalCode ? ', ' + formData.postalCode : ''}`,
        customerEmail: '',
        notes: formData.notes,
        items: orderItems,
        shippingMethodId: selectedShipping || undefined,
        couponCode: couponApplied ? couponCode.toUpperCase() : undefined,
        discountAmount: couponApplied ? discount : 0,
        deliveryCharge,
        total,
      }, { validateStatus: (status) => status < 500 });

      if (res.data.success) {
        setOrderSuccess({ orderNumber: res.data.data?.orderNumber || 'N/A' });
        clearCart();
        showToast.success('Order placed successfully!');
      } else {
        showToast.error(res.data.message || 'Failed to place order');
      }
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      showToast.error(axiosError.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <>
        <EcommerceHeader />
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center bg-white rounded-sm border border-gray-100 p-8 shadow-lg">
            <div className="w-20 h-20 bg-red-100 rounded-sm flex items-center justify-center mx-auto mb-6">
              <FiCheck className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h2>
            <p className="text-gray-500 mb-2">Your order number</p>
            <div className="text-2xl font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 py-3 px-6 rounded-sm mb-6 inline-block">
              #{orderSuccess.orderNumber}
            </div>
            <p className="text-sm text-gray-500 mb-6">We'll send you a confirmation shortly.</p>
                  <button
                    onClick={() => router.push('/products')}
                    className="w-full bg-blue-600 text-white py-3 rounded-sm font-semibold hover:bg-blue-700 mb-3"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => router.push('/account')}
                    className="w-full text-gray-600 py-3 rounded-sm font-semibold hover:bg-gray-50 border border-gray-200"
                  >
                    View Orders
                  </button>
          </div>
        </div>
        <EcommerceFooter />
      </>
    );
  }

  return (
    <>
      <EcommerceHeader />
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button onClick={() => router.push('/cart')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
            <FiArrowLeft className="w-4 h-4" /> Back to Cart
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Contact & Address */}
              <div className="bg-white border border-gray-100 rounded-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-sm flex items-center justify-center text-sm font-bold">1</div>
                  <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="01712345678"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                    <input
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="House, Street, Area"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value={formData.addressLine2}
                      onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Apartment, Suite"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Dhaka"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any special instructions"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Method */}
              {shippingMethods.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-sm flex items-center justify-center text-sm font-bold">2</div>
                    <h2 className="text-lg font-bold text-gray-900">Shipping Method</h2>
                  </div>
                  <div className="space-y-3">
                    {shippingMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 border rounded-sm cursor-pointer transition-all ${
                          selectedShipping === method.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          checked={selectedShipping === method.id}
                          onChange={() => setSelectedShipping(method.id)}
                          className="text-blue-600"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{method.name}</p>
                          {method.description && <p className="text-xs text-gray-500">{method.description}</p>}
                          {method.estimatedDays && <p className="text-xs text-gray-400">{method.estimatedDays}</p>}
                        </div>
                        <span className="font-bold text-gray-900">
                          {method.price === 0 ? 'Free' : `৳${method.price.toFixed(0)}`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              <div className="bg-white border border-gray-100 rounded-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-sm flex items-center justify-center text-sm font-bold">
                    {shippingMethods.length > 0 ? '3' : '2'}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Payment</h2>
                </div>
                <div className="p-4 bg-gray-50 rounded-sm">
                  <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                    <FiCreditCard className="w-4 h-4" />
                    Cash on Delivery
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Pay when you receive your order</p>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <div className="bg-white border border-gray-100 rounded-sm p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                        <img src={item.image || '/placeholder.png'} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        <p className="text-xs font-bold text-gray-900">৳{(item.price * item.quantity).toFixed(0)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    disabled={couponApplied}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponApplied || !couponCode.trim()}
                    className="px-4 py-2 bg-gray-900 text-white rounded-sm text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
                  >
                    {couponApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>

                <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">৳{cartTotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">{deliveryCharge === 0 ? 'Free' : `৳${deliveryCharge.toFixed(0)}`}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount</span>
                      <span className="font-semibold">-৳{discount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base border-t border-gray-100 pt-2">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">৳{total.toFixed(0)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="mt-6 w-full bg-blue-600 text-white py-3 rounded-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EcommerceFooter />
    </>
  );
}