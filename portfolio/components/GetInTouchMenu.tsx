"use client";

import { useState } from "react";
import { Mail, Link2 } from "lucide-react";
import { Github, Linkedin } from "./icons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { socials } from "@/config/socials";

interface GetInTouchMenuProps {
  trigger: "hover" | "click";
  className?: string;
  children: React.ReactNode;
}

const SOCIAL_LINKS = [
  { name: "Email", href: `mailto:${socials.email}`, icon: Mail },
  { name: "LinkedIn", href: socials.linkedin, icon: Linkedin },
  { name: "GitHub", href: socials.github, icon: Github },
];

export default function GetInTouchMenu({ trigger, className, children }: GetInTouchMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMouseEnter = () => { if (trigger === "hover") setIsOpen(true); };
  const handleMouseLeave = () => { if (trigger === "hover") setIsOpen(false); };
  const handleClick = () => { if (trigger === "click") setIsOpen(!isOpen); };

  return (
    <>
      {/* Button + dropdown — z-[70] so it floats above the blur overlay */}
      <div
        className={cn("relative z-[70]", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {children}

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-4 flex flex-col gap-3"
            >
              {SOCIAL_LINKS.map((social, i) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    onClick={() => setIsOpen(false)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                    className="w-12 h-12 rounded-full bg-sage-white flex items-center justify-center text-forest-700 shadow-lg hover:scale-110 hover:shadow-xl hover:bg-forest-700 hover:text-sage-white transition-all"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Backdrop: z-[60] — sits above header (z-50) but below the button/dropdown (z-[70]) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-charcoal-green/30 backdrop-blur-md pointer-events-none"
          />
        )}
      </AnimatePresence>
    </>
  );
}
