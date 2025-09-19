// components/layout/auth/auth-footer.tsx
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { slideUp } from "@/lib/animations";

export function AuthFooter() {
  const t = useTranslations("AuthLayout");
  
  return (
    <motion.footer
      className="py-6 px-4 sm:px-6 lg:px-8"
      variants={slideUp}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.2 }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <Link href="/legal/privacy" className="hover:text-primary transition-colors">
            {t("privacyPolicy")}
          </Link>
          <span className="text-border">|</span>
          <Link href="/contact" className="hover:text-primary transition-colors">
            {t("contactSupport")}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher variant="compact" />
          {/* ✅ Use the new key with the year variable */}
          <span>{t("copyright", { year: new Date().getFullYear() })}</span>
        </div>
      </div>
    </motion.footer>
  );
}