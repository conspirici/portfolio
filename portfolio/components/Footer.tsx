"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { Github, Linkedin } from "./icons";
import { socials } from "@/config/socials";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { site } from "@/config/site";

const NAV_LINKS = [
  { name: "Work", href: "/work" },
  { name: "Writing", href: "/writing" },
  { name: "Field Notes", href: "/field-notes" },
  { name: "About", href: "/about" },
];

const SOCIAL_LINKS = [
  { name: "Email", href: `mailto:${socials.email}`, icon: Mail },
  { name: "LinkedIn", href: socials.linkedin, icon: Linkedin },
  { name: "GitHub", href: socials.github, icon: Github },
];

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="w-full bg-forest-900 text-sage-white">
      <div className="w-full h-1 bg-gradient-to-r from-forest-700 to-teal-700" />
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 flex flex-col gap-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Nav Links */}
          <nav className="flex flex-wrap items-center justify-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-sans text-sm font-medium text-sage-white/85 hover:text-sage-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="w-12 h-12 bg-forest-700 flex items-center justify-center text-sage-white hover:bg-teal-700 transition-colors"
                  aria-label={social.name}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-sage-white/10">
          <p className="font-mono text-xs text-sage-white/60">
            Built and engineered by {site.name}.
          </p>
          <p className="font-mono text-xs text-sage-white/60">
            &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
