"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X, Mail } from "lucide-react";
import { Github, Linkedin } from "./icons";
import GetInTouchMenu from "./GetInTouchMenu";
import { cn } from "@/lib/cn";
import { motion, AnimatePresence } from "framer-motion";
import { site } from "@/config/site";
import { socials } from "@/config/socials";

const NAV_LINKS = [
  { name: "Work", href: "/work" },
  { name: "Writing", href: "/writing" },
  { name: "Field Notes", href: "/field-notes" },
  { name: "About", href: "/about" },
];

const SOCIAL_LINKS = [
  { name: "Email", href: `mailto:${socials.email}`, icon: Mail, label: "Drop a line" },
  { name: "LinkedIn", href: socials.linkedin, icon: Linkedin, label: "LinkedIn" },
  { name: "GitHub", href: socials.github, icon: Github, label: "GitHub" },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close on route change
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  const isLightPage = pathname !== "/" && !pathname.startsWith("/field-notes");
  const showDarkHeader = isScrolled || isLightPage;

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-sage-white border-b border-warm-gray-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          {/* Logo / Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="font-display text-xl text-charcoal-green group-hover:text-forest-700 transition-colors">
              {site.name}
            </span>
            <span className="hidden lg:inline-block text-sm text-charcoal-green/50">
              {site.title}
            </span>
          </Link>

          {/* Desktop Nav + CTA */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-8">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "font-sans text-sm font-medium transition-colors",
                      isActive
                        ? "text-forest-700"
                        : "text-charcoal-green/70 hover:text-charcoal-green"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <GetInTouchMenu trigger="hover">
              <button className="flex items-center gap-2 px-5 py-2.5 border border-forest-700 text-forest-700 font-mono text-xs uppercase tracking-wider hover:bg-forest-700 hover:text-sage-white transition-all group">
                Get in Touch
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </GetInTouchMenu>
          </div>

          {/* Mobile: hamburger only — right side */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-charcoal-green"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Blurred backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[80] bg-charcoal-green/30 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-in drawer — right half */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-[65vw] max-w-xs z-[90] bg-sage-white flex flex-col shadow-2xl md:hidden"
            >
              {/* Drawer header */}
              <div className="h-20 flex items-center justify-between px-6 border-b border-warm-gray-200">
                <span className="font-mono text-xs tracking-widest text-charcoal-green/40 uppercase">Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 flex items-center justify-center text-charcoal-green hover:bg-warm-gray-200 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col px-6 pt-4 flex-1 overflow-y-auto">
                {NAV_LINKS.map((link, i) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.2 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between py-4 border-b border-warm-gray-200/70 font-display text-2xl transition-colors group",
                          isActive ? "text-forest-700" : "text-charcoal-green hover:text-forest-700"
                        )}
                      >
                        {link.name}
                        <ArrowRight className={cn(
                          "w-4 h-4 transition-all -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                          isActive && "translate-x-0 opacity-100 text-forest-700"
                        )} />
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Connect section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="px-6 pb-8 pt-6 border-t border-warm-gray-200"
              >
                <p className="font-mono text-[10px] tracking-widest text-charcoal-green/40 uppercase mb-4">
                  Connect
                </p>
                <div className="flex flex-col gap-3">
                  {SOCIAL_LINKS.map((s) => {
                    const Icon = s.icon;
                    return (
                      <a
                        key={s.name}
                        href={s.href}
                        target={s.href.startsWith("http") ? "_blank" : undefined}
                        rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="flex items-center gap-3 text-charcoal-green hover:text-forest-700 transition-colors group"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="w-8 h-8 bg-warm-gray-200 group-hover:bg-forest-700 group-hover:text-sage-white flex items-center justify-center transition-all">
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="font-sans text-sm">{s.label}</span>
                      </a>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
