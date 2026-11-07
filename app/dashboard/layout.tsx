'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import ProtectedRoute from '@/components/dashboard/ProtectedRoute';
import { SuperAdminNotificationsProvider } from '@/contexts/SuperAdminNotificationsContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SuperAdminNotificationsProvider>
        <div className="flex h-screen overflow-hidden bg-white">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-gray-50 min-w-0">
            <div className="p-4 md:p-6 pt-16 md:pt-6 max-w-full">
              {children}
            </div>
          </main>
        </div>
      </SuperAdminNotificationsProvider>
    </ProtectedRoute>
  );
}
