'use client';

import React from 'react';
import { FiBell, FiSearch } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import BranchSelector from '@/components/dashboard/BranchSelector';
import { useSidebar } from '@/contexts/SidebarContext';

export const DashboardHeader: React.FC = () => {
  const { user } = useAuth();
  const { toggleMobile } = useSidebar();

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobile}
          className="md:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <FiSearch className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-40 md:w-64 px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <BranchSelector />
      </div>

      <div className="flex items-center gap-3">
        <button className="relative w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm">
          <FiBell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold rounded-sm">
            {user?.email?.split('@')[0]?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
              {user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
