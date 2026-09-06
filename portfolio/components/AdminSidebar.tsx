"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { Menu, X, LogOut, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

const navItems = [
  { name: "Dashboard", path: "/admin" },
  { name: "Home", path: "/admin/home" },
  { name: "Projects", path: "/admin/projects" },
  { name: "Writing", path: "/admin/writing" },
  { name: "Field Notes", path: "/admin/field-notes" },
  { name: "About", path: "/admin/about" },
  { name: "Settings", path: "/admin/settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (pathname === "/admin/login") {
    return null;
  }

  return (
    <>
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden md:flex w-64 bg-black border-r border-forest-800 text-white min-h-screen p-6 flex-col shrink-0">
        <div className="text-xl font-bold mb-10 tracking-tight text-white/90">
          Admin CMS
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (pathname.startsWith(`${item.path}/`) && item.path !== "/admin");
            const isStrictActive = pathname === item.path;
            const activeCondition = item.path === "/admin" ? isStrictActive : isActive;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`block px-4 py-2 transition-colors rounded-sm ${
                  activeCondition ? "bg-white/10 text-white" : "text-sage-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto px-4 py-2 text-left text-sage-white/70 hover:text-red-400 hover:bg-white/5 transition-colors rounded-sm flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </aside>

      {/* --- Mobile Top Bar --- */}
      <div className="md:hidden flex items-center justify-between bg-black border-b border-forest-800 p-4 sticky top-0 z-40">
        <div className="text-lg font-bold tracking-tight text-white">
          Admin CMS
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="text-sage-white hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* --- Mobile Slide-in Drawer --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-[75vw] max-w-sm z-[90] bg-forest-900 border-r border-forest-800 flex flex-col shadow-2xl md:hidden"
            >
              {/* Drawer Header */}
              <div className="h-16 flex items-center justify-between px-6 border-b border-forest-800 bg-black">
                <span className="font-bold text-white tracking-tight">Admin CMS</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-sage-white hover:text-white hover:bg-forest-800 rounded transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav Links */}
              <nav className="flex flex-col px-4 pt-6 flex-1 overflow-y-auto space-y-2">
                {navItems.map((item, i) => {
                  const isActive = pathname === item.path || (pathname.startsWith(`${item.path}/`) && item.path !== "/admin");
                  const isStrictActive = pathname === item.path;
                  const activeCondition = item.path === "/admin" ? isStrictActive : isActive;

                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.2 }}
                    >
                      <Link
                        href={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 border border-transparent rounded transition-colors group",
                          activeCondition 
                            ? "bg-forest-800 border-forest-700 text-white" 
                            : "text-sage-white hover:bg-forest-800 hover:text-white"
                        )}
                      >
                        <span className="font-medium text-lg">{item.name}</span>
                        <ChevronRight className={cn(
                          "w-5 h-5 transition-all opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100",
                          activeCondition && "opacity-100 translate-x-0 text-white"
                        )} />
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 border-t border-forest-800 bg-black"
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-forest-800 hover:bg-red-900/50 hover:text-red-400 text-sage-white transition-colors rounded"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
