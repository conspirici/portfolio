"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

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

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  if (pathname === "/admin/login") {
    return null; // Don't show sidebar on login page
  }

  return (
    <aside className="w-64 bg-black border-r border-forest-800 text-white min-h-screen p-6 flex flex-col">
      <div className="text-xl font-bold mb-10 tracking-tight text-white/90">
        Admin CMS
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`) && item.path !== "/admin";
          const isStrictActive = pathname === item.path;
          const activeCondition = item.path === "/admin" ? isStrictActive : isActive;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-4 py-2 transition-colors ${
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
        className="mt-auto px-4 py-2 text-left text-sage-white/70 hover:text-white hover:bg-white/5 transition-colors"
      >
        Logout
      </button>
    </aside>
  );
}
