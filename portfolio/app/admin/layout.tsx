import React from "react";
import { AuthProvider } from "../../components/AuthProvider";
import { AdminGuard } from "./AdminGuard";
import { AdminSidebar } from "../../components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminGuard>
        <div className="flex flex-col md:flex-row min-h-screen bg-forest-900 text-sage-white">
          <AdminSidebar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            {children}
          </main>
        </div>
      </AdminGuard>
    </AuthProvider>
  );
}
