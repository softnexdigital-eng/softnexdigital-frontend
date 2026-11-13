'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BranchSelector from '@/components/dashboard/BranchSelector';
import ProtectedRoute from '@/components/dashboard/ProtectedRoute';
import { SuperAdminNotificationsProvider } from '@/contexts/SuperAdminNotificationsContext';
import { BranchProvider } from '@/contexts/BranchContext';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <BranchProvider>
        <ProtectedRoute>
          <SuperAdminNotificationsProvider>
            <div className="flex h-screen overflow-hidden bg-white">
              <Sidebar />
              <main className="flex-1 overflow-y-auto bg-gray-50 min-w-0">
                <DashboardHeader />
                <div className="p-4 md:p-6 pt-4 max-w-full">
                  {children}
                </div>
              </main>
            </div>
          </SuperAdminNotificationsProvider>
        </ProtectedRoute>
      </BranchProvider>
    </SidebarProvider>
  );
}
