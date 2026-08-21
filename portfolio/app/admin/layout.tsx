import React from "react";
import { AuthProvider } from "../../components/AuthProvider";
import { AdminGuard } from "./AdminGuard";
import { AdminSidebar } from "../../components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminGuard>
        <div className="flex min-h-screen bg-forest-900 text-sage-white">
          <AdminSidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </AdminGuard>
    </AuthProvider>
  );
}
