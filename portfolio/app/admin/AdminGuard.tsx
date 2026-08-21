"use client";

import React, { useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";
import { useRouter, usePathname } from "next/navigation";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    } else if (!loading && user && pathname === "/admin/login") {
      router.push("/admin");
    }
  }, [user, loading, router, pathname]);

  // Prevent SSR mismatch by just returning null or a completely empty matching div on server
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-forest-900 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-forest-500/20 border-t-forest-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && pathname !== "/admin/login") {
    return null;
  }

  return <>{children}</>;
}
