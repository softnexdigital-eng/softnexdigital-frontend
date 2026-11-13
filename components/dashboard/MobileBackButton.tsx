'use client';

import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';

export default function MobileBackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="md:hidden fixed top-4 left-14 z-50 w-10 h-10 rounded-sm bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all text-gray-700"
      title="Go back"
    >
      <FiArrowLeft className="w-5 h-5" />
    </button>
  );
}