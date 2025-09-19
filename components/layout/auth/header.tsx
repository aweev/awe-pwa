// components/layout/auth/header.tsx
"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { HeaderLogo } from "@/components/common/brand-logo";
import { slideUp } from "@/lib/animations";
import { ThemeToggle } from "@/components/common/theme-toggle";

export function AuthHeader() {
  const locale = useLocale();

  return (
    <motion.header
      className="py-4 px-4 sm:px-6 lg:px-8"
      variants={slideUp}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-center">
        {/* The logo links back to the homepage */}
        <HeaderLogo href={`/${locale}`} />
        <ThemeToggle variant="simple" />
      </div>
    </motion.header>
  );
}