'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';

interface PageVisit {
  id: string;
  slug: string;
  createdAt: string;
  tenant: { id: string; name: string };
}

interface PageVisitsResponse {
  success: boolean;
  message?: string;
  data?: {
    visits: PageVisit[];
    total: number;
    page: number;
    limit: number;
  };
}

export default function PageVisitsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [visits, setVisits] = useState<PageVisit[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [slugInput, setSlugInput] = useState('');
  const [slugFilter, setSlugFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const limit = 20;

  const fetchVisits = useCallback(async (signal: AbortSignal) => {
    if (!isSuperAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<PageVisitsResponse>(
        '/dashboard/super-admin/page-visits',
        {
          params: {
            page,
            limit,
            ...(slugFilter ? { slug: slugFilter } : {}),
          },
          signal,
        },
      );
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to load page visits');
      }

      setVisits(response.data.data.visits);
      setTotal(response.data.data.total);
    } catch (requestError) {
      if (axios.isCancel(requestError)) return;
      const responseMessage = (
        requestError as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      setError(
        responseMessage ||
          (requestError instanceof Error ? requestError.message : 'Failed to load page visits'),
      );
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [isSuperAdmin, page, slugFilter]);

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.replace('/dashboard');
    }
  }, [authLoading, isSuperAdmin, router]);

  useEffect(() => {
    if (authLoading || !isSuperAdmin) return;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void fetchVisits(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [authLoading, fetchVisits, isSuperAdmin]);

  const applySlugFilter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSlugFilter(slugInput.trim());
  };

  if (authLoading || !isSuperAdmin) {
    return <p className="py-16 text-center text-gray-600">Loading...</p>;
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Page Visits</h1>
          <p className="mt-1 text-sm text-gray-600">Browse storefront page visits by slug.</p>
        </div>
        <form onSubmit={applySlugFilter} className="flex gap-2">
          <label className="sr-only" htmlFor="page-visits-slug">Filter by slug</label>
          <input
            id="page-visits-slug"
            value={slugInput}
            onChange={event => setSlugInput(event.target.value)}
            placeholder="Filter by slug"
            className="min-h-10 border border-gray-300 bg-white px-3 text-sm text-gray-900"
          />
          <button
            type="submit"
            className="inline-flex min-h-10 items-center gap-2 bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-700"
          >
            <FiSearch aria-hidden="true" />
            Filter
          </button>
        </form>
      </div>

      {error && (
        <div role="alert" className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load page visits: {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th scope="col" className="px-4 py-3">Page slug</th>
              <th scope="col" className="px-4 py-3">Shop / tenant</th>
              <th scope="col" className="px-4 py-3">Visit time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={3} className="px-4 py-10 text-center text-gray-600">Loading page visits...</td></tr>
            ) : visits.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-10 text-center text-gray-600">No page visits found.</td></tr>
            ) : visits.map(visit => (
              <tr key={visit.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{visit.slug}</td>
                <td className="px-4 py-3 text-gray-700">{visit.tenant?.name || 'Unknown tenant'}</td>
                <td className="px-4 py-3 text-gray-600">
                  <time dateTime={visit.createdAt}>{new Date(visit.createdAt).toLocaleString()}</time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-gray-600">
        <span>
          {total === 0 ? '0 visits' : `${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total}`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage(current => Math.max(1, current - 1))}
            disabled={page <= 1 || loading}
            aria-label="Previous page"
            className="border border-gray-300 p-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronLeft aria-hidden="true" />
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage(current => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages || loading}
            aria-label="Next page"
            className="border border-gray-300 p-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
