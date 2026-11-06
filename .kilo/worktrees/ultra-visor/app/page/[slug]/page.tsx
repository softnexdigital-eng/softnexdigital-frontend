'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import EcommerceHeader from '@/components/ecommerce/EcommerceHeader';
import EcommerceFooter from '@/components/ecommerce/EcommerceFooter';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: any;
  metaTitle?: string;
  metaDesc?: string;
  createdAt: string;
}

export default function DynamicPage() {
  const params = useParams();
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/public/page/${params.slug}`);
      if (res.data.success) {
        setPage(res.data.data);
      } else {
        router.push('/products');
      }
    } catch {
      router.push('/products');
    } finally {
      setLoading(false);
    }
  }, [params.slug, router]);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  if (loading) {
    return (
      <>
        <EcommerceHeader />
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 flex items-center justify-center">
          <div className="animate-spin rounded-sm h-10 w-10 border-2 border-blue-600 border-t-transparent" />
        </div>
        <EcommerceFooter />
      </>
    );
  }

  if (!page) return null;

  const renderContent = (content: any) => {
    if (typeof content === 'string') {
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }
    if (typeof content === 'object' && content !== null) {
      if (content.blocks) {
        return content.blocks.map((block: any, i: number) => {
          switch (block.type) {
            case 'paragraph':
              return <p key={i} className="text-gray-600 leading-relaxed mb-4">{block.data?.text || ''}</p>;
            case 'header':
              const level = block.data?.level || 2;
              const hMap: Record<number, React.ReactNode> = {
                1: <h1 key={i} className="font-bold text-gray-900 text-2xl mb-3">{block.data?.text || ''}</h1>,
                2: <h2 key={i} className="font-bold text-gray-900 text-xl mb-3">{block.data?.text || ''}</h2>,
                3: <h3 key={i} className="font-bold text-gray-900 text-lg mb-3">{block.data?.text || ''}</h3>,
                4: <h4 key={i} className="font-bold text-gray-900 text-base mb-3">{block.data?.text || ''}</h4>,
              };
              return hMap[level] || hMap[2];
            case 'list':
              const items = block.data?.items || [];
              return (
                <ul key={i} className="list-disc pl-5 text-gray-600 space-y-1 mb-4">
                  {items.map((item: string, j: number) => <li key={j}>{item}</li>)}
                </ul>
              );
            default:
              return null;
          }
        });
      }
    }
    return <p className="text-gray-600">{page.metaDesc || 'No content available.'}</p>;
  };

  return (
    <>
      <EcommerceHeader />
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{page.title}</h1>
          <div className="bg-white border border-gray-100 rounded-sm p-8">
            {renderContent(page.content)}
          </div>
        </div>
      </div>
      <EcommerceFooter />
    </>
  );
}