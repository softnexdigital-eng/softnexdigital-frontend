'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface Branch {
  id: string;
  name: string;
  code: string;
  isDefault: boolean;
  isActive: boolean;
}

interface BranchContextType {
  branches: Branch[];
  selectedBranchId: string | null;
  selectedBranch: Branch | null;
  loading: boolean;
  setBranches: (branches: Branch[]) => void;
  selectBranch: (branchId: string | null) => void;
  refreshBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : localStorage.getItem('selectedBranchId'),
  );
  const [loading, setLoading] = useState(true);

  const refreshBranches = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/branches?page=1&limit=100');
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to fetch branches');
      }
      const availableBranches: Branch[] = res.data.data.branches;
      setBranches(availableBranches);
      const savedBranchId = localStorage.getItem('selectedBranchId');
      if (savedBranchId && !availableBranches.some((branch) => branch.id === savedBranchId && branch.isActive)) {
        localStorage.removeItem('selectedBranchId');
        setSelectedBranchId(null);
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refreshBranches);
  }, [refreshBranches]);

  const selectBranch = (branchId: string | null) => {
    setSelectedBranchId(branchId);
    if (branchId) {
      localStorage.setItem('selectedBranchId', branchId);
    } else {
      localStorage.removeItem('selectedBranchId');
    }
  };

  const selectedBranch = branches.find(b => b.id === selectedBranchId) || null;

  return (
    <BranchContext.Provider
      value={{
        branches,
        selectedBranchId,
        selectedBranch,
        loading,
        setBranches,
        selectBranch,
        refreshBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};