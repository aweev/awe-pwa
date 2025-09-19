// components/layout/public/footer.tsx
"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { FooterLogo } from "@/components/common/brand-logo";

export function PublicFooter() {
  const t = useTranslations("PublicFooter");

  return (
    <footer className="bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 border-t border-border/60 mt-auto relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-texture-paper opacity-30 dark:opacity-15" />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/2 via-transparent to-accent/3" />

      {/* <div className="relative container w-full max-w-full px-6 md:px-8 lg:px-12"> */}
      <div className="relative container mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Enhanced Brand Section */}
          <div className="col-span-full lg:col-span-2 space-y-6">
            <FooterLogo brandName={t("brandName")} />

            <p className="text-muted-foreground text-body-base max-w-md leading-relaxed">
              {t("tagline")}
            </p>

            {/* Enhanced Social Links */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full" />
                <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {t("followUs")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  className="group p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/15 border border-primary/10 hover:border-primary/20 text-primary hover:text-primary/90 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                  aria-label="Twitter"
                >
                  <Icon name="twitter" className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                </a>
                <a
                  href="#"
                  className="group p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/15 border border-primary/10 hover:border-primary/20 text-primary hover:text-primary/90 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                  aria-label="LinkedIn"
                >
                  <Icon name="linkedin" className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                </a>
                <a
                  href="#"
                  className="group p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/15 border border-primary/10 hover:border-primary/20 text-primary hover:text-primary/90 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                  aria-label="Facebook"
                >
                  <Icon name="facebook" className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                </a>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation Sections */}
          <div className="space-y-6">
            <div className="relative">
              <h4 className="font-serif font-semibold text-base bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent pb-3">
                {t("sections.about.title")}
              </h4>
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full" />
            </div>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about/story"
                  className="group flex items-center gap-2 text-small-meta text-muted-foreground hover:text-primary transition-all duration-300 py-1 px-2 -mx-2 rounded-lg hover:bg-primary/5"
                >
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    {t("sections.about.story")}
                  </span>
                  <Icon name="externalLink" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </li>
              <li>
                <Link
                  href="/about/team"
                  className="group flex items-center gap-2 text-small-meta text-muted-foreground hover:text-primary transition-all duration-300 py-1 px-2 -mx-2 rounded-lg hover:bg-primary/5"
                >
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    {t("sections.about.team")}
                  </span>
                  <Icon name="externalLink" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </li>
              <li>
                <Link
                  href="/about/approach"
                  className="group flex items-center gap-2 text-small-meta text-muted-foreground hover:text-primary transition-all duration-300 py-1 px-2 -mx-2 rounded-lg hover:bg-primary/5"
                >
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    {t("sections.about.approach")}
                  </span>
                  <Icon name="externalLink" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <h4 className="font-serif font-semibold text-base bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent pb-3">
                {t("sections.getInvolved.title")}
              </h4>
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full" />
            </div>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/get-involved/donate"
                  className="group flex items-center gap-2 text-small-meta text-muted-foreground hover:text-primary transition-all duration-300 py-1 px-2 -mx-2 rounded-lg hover:bg-primary/5"
                >
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    {t("sections.getInvolved.donate")}
                  </span>
                  <Icon name="externalLink" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </li>
              <li>
                <Link
                  href="/get-involved/volunteer"
                  className="group flex items-center gap-2 text-small-meta text-muted-foreground hover:text-primary transition-all duration-300 py-1 px-2 -mx-2 rounded-lg hover:bg-primary/5"
                >
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    {t("sections.getInvolved.volunteer")}
                  </span>
                  <Icon name="externalLink" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </li>
              <li>
                <Link
                  href="/get-involved/partner"
                  className="group flex items-center gap-2 text-small-meta text-muted-foreground hover:text-primary transition-all duration-300 py-1 px-2 -mx-2 rounded-lg hover:bg-primary/5"
                >
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    {t("sections.getInvolved.partner")}
                  </span>
                  <Icon name="externalLink" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <h4 className="font-serif font-semibold text-base bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent pb-3">
                {t("sections.legal.title")}
              </h4>
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full" />
            </div>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/legal/privacy"
                  className="group flex items-center gap-2 text-small-meta text-muted-foreground hover:text-primary transition-all duration-300 py-1 px-2 -mx-2 rounded-lg hover:bg-primary/5"
                >
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    {t("sections.legal.privacy")}
                  </span>
                  <Icon name="externalLink" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="group flex items-center gap-2 text-small-meta text-muted-foreground hover:text-primary transition-all duration-300 py-1 px-2 -mx-2 rounded-lg hover:bg-primary/5"
                >
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    {t("sections.legal.terms")}
                  </span>
                  <Icon name="externalLink" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/contact"
                  className="group flex items-center gap-2 text-small-meta text-muted-foreground hover:text-primary transition-all duration-300 py-1 px-2 -mx-2 rounded-lg hover:bg-primary/5"
                >
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    {t("sections.legal.contact")}
                  </span>
                  <Icon name="externalLink" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Enhanced Bottom Bar */}
        <div className="py-8 flex flex-col-reverse lg:flex-row items-center justify-between border-t border-gradient-to-r from-primary/20 via-border/60 to-accent/20 gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <p className="text-small-meta text-muted-foreground">
              &copy; {new Date().getFullYear()} AWE e.V. {t("rightsReserved")}
            </p>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse shadow-sm shadow-primary/30" />
                <div
                  className="w-1.5 h-1.5 bg-gradient-to-r from-accent to-primary rounded-full animate-pulse shadow-sm shadow-accent/30"
                  style={{ animationDelay: "0.5s" }}
                />
              </div>
              <span className="bg-gradient-to-r from-primary/80 to-accent/80 bg-clip-text text-transparent font-medium">
                {t("motto")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
            <LanguageSwitcher />
            <div className="w-px h-6 bg-gradient-to-b from-primary/20 to-accent/20" />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Enhanced Accent Bottom Border */}
      <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
      <div className="h-0.5 bg-gradient-to-r from-primary/50 via-accent to-primary/50 opacity-60" />

      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-primary/3 to-transparent rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/3 w-48 h-48 bg-gradient-to-tl from-accent/4 to-transparent rounded-full blur-2xl translate-y-1/2" />
    </footer>
  );
}
