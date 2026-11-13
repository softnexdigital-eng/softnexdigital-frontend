'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

type OrderTracking = {
  orderNumber: string;
  status: string;
  deliveryStatus: string | null;
  courierStatus: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory: {
    status: string;
    note: string | null;
    createdAt: string;
  }[];
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVEred: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
};

export default function TrackOrderPage() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber;
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    api.get(`/public/orders/track/${encodeURIComponent(orderNumber)}`)
      .then(({ data }) => {
        if (active && data.success) setOrder(data.data);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError.response?.status === 404
            ? 'We could not find an order with this number.'
            : 'Unable to load order tracking right now. Please try again later.',
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderNumber]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-medium text-blue-700 hover:underline">
          Back to store
        </Link>
        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">Track your order</h1>
          <p className="mt-2 text-sm text-slate-500">Order #{orderNumber}</p>

          {loading && <p className="mt-8 text-slate-600">Loading order status...</p>}

          {!loading && error && (
            <p role="alert" className="mt-8 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          )}

          {!loading && order && (
            <>
              <div className="mt-6 rounded-lg bg-blue-50 p-5">
                <p className="text-sm text-blue-700">Current status</p>
                <p className="mt-1 text-xl font-semibold text-blue-950">
                  {statusLabels[order.status] || order.status}
                </p>
                {(order.deliveryStatus || order.courierStatus) && (
                  <p className="mt-2 text-sm text-blue-800">
                    Delivery: {order.deliveryStatus || order.courierStatus}
                  </p>
                )}
              </div>

              <h2 className="mt-8 text-lg font-semibold text-slate-900">Status history</h2>
              <ol className="mt-4 space-y-4">
                {order.statusHistory.map((entry, index) => (
                  <li key={`${entry.status}-${entry.createdAt}-${index}`} className="border-l-2 border-blue-200 pl-4">
                    <p className="font-medium text-slate-900">
                      {statusLabels[entry.status] || entry.status}
                    </p>
                    <time className="mt-1 block text-sm text-slate-500">
                      {new Date(entry.createdAt).toLocaleString()}
                    </time>
                    {entry.note && <p className="mt-1 text-sm text-slate-600">{entry.note}</p>}
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
