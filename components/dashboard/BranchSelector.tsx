'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FiChevronDown, FiGlobe } from 'react-icons/fi';
import { useBranch } from '@/contexts/BranchContext';
import { useAuth } from '@/contexts/AuthContext';

export const BranchSelector: React.FC = () => {
  const { branches, selectedBranchId, selectedBranch, loading, selectBranch } = useBranch();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canSelectAllBranches = ['SUPER_ADMIN', 'TENANT_OWNER', 'BUSINESS_ADMIN', 'OWNER'].includes(user?.role || '');

  const branchesByDefault = useMemo(() => {
    const filtered = branches.filter((b) => b.isActive);
    if (filtered.length === 0) return [];
    const sorted = [...filtered].sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }, [branches]);

  useEffect(() => {
    if (!loading && !canSelectAllBranches && !selectedBranchId) {
      const defaultBranch = branchesByDefault.find((branch) => branch.isDefault) || branchesByDefault[0];
      if (defaultBranch) selectBranch(defaultBranch.id);
    }
  }, [branchesByDefault, canSelectAllBranches, loading, selectBranch, selectedBranchId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (branchId: string | null) => {
    selectBranch(branchId);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors text-sm min-h-[36px]"
        aria-label="Select branch"
      >
        <FiGlobe className="w-4 h-4 text-gray-500" />
        <span className="font-medium text-gray-900 truncate max-w-[160px]">
          {selectedBranch?.name || (canSelectAllBranches ? 'All Branches' : 'Select Branch')}
        </span>
        <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-sm shadow-lg border border-gray-200 z-50 max-h-72 overflow-y-auto">
          <div className="p-2">
            {canSelectAllBranches && (
              <button
                onClick={() => handleSelect(null)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-sm text-sm hover:bg-gray-50 min-h-12 ${selectedBranchId === null ? 'bg-gray-100 font-medium' : ''}`}
              >
                <FiGlobe className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">All Branches</span>
              </button>
            )}

            {loading ? (
              <div className="px-3 py-2 text-sm text-gray-400">Loading branches...</div>
            ) : branchesByDefault.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">No branches available</div>
            ) : (
              branchesByDefault.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleSelect(branch.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-sm text-sm hover:bg-gray-50 ${selectedBranchId === branch.id ? 'bg-gray-100 font-medium' : ''}`}
                >
                  <FiGlobe className="w-4 h-4 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{branch.name}</p>
                    <p className="text-xs text-gray-500">{branch.code}</p>
                  </div>
                  {branch.isDefault && <span className="text-xs text-gray-500">Default</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchSelector;
