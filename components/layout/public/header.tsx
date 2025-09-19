// components/layout/public/header.tsx 
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Icon } from "@/components/ui/icon";

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { BrandLogo } from '@/components/common/brand-logo';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface PublicHeaderProps {
  locale: string;
}

export function PublicHeader({ locale }: PublicHeaderProps) {
  const t = useTranslations('PublicHeader');
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const programs = [
    {
      title: t('programs.economic.title'),
      description: t('programs.economic.description'),
      href: `/${locale}/programs/economic-empowerment`,
      icon: <Icon name="target" className="h-4 w-4" />,
    },
    {
      title: t('programs.education.title'),
      description: t('programs.education.description'),
      href: `/${locale}/programs/education-youth`,
      icon: <Icon name="bookOpen" className="h-4 w-4" />,
    },
    {
      title: t('programs.health.title'),
      description: t('programs.health.description'),
      href: `/${locale}/programs/health-wellness`,
      icon: <Icon name="award" className="h-4 w-4" />,
    },
    {
      title: t('programs.social.title'),
      description: t('programs.social.description'),
      href: `/${locale}/programs/social-integration`,
      icon: <Icon name ="globe" className="h-4 w-4" />,
    },
  ];

  return (
    <motion.header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
          : 'bg-background/80'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <BrandLogo href={`/${locale}`} />
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                {/* About */}
                <NavigationMenuItem>
                  <Link href={`/${locale}/about`} className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                      {t('nav.about')}
                  </Link>
                </NavigationMenuItem>

                {/* Programs Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    {t('nav.programs')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-2">
                      {programs.map((program) => (
                        <li key={program.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={program.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                {program.icon}
                                {program.title}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {program.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Impact */}
                <NavigationMenuItem>
                  <Link href={`/${locale}/impact`} className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                      {t('nav.impact')}
                  </Link>
                </NavigationMenuItem>

                {/* Get Involved */}
                <NavigationMenuItem>
                  <Link href={`/${locale}/get-involved`} className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                      {t('nav.getInvolved')}
                  </Link>
                </NavigationMenuItem>

                {/* News */}
                <NavigationMenuItem>
                  <Link href={`/${locale}/news`} className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                      {t('nav.news')}
                  </Link>
                </NavigationMenuItem>

                {/* Contact */}
                <NavigationMenuItem>
                  <Link href={`/${locale}/contact`} className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                      {t('nav.contact')}
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Desktop CTA & Utilities */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${locale}/get-involved/volunteer`}>
                <Icon name="users" className="h-4 w-4 mr-2" />
                {t('cta.volunteer')}
              </Link>
            </Button>
            
            <Button size="sm" asChild className="bg-primary hover:bg-primary/90">
              <Link href={`/${locale}/get-involved/donate`}>
                <Icon name="heart" className="h-4 w-4 mr-2" />
                {t('cta.donate')}
                <Icon name="arrowRight" className="h-4 w-4 ml-2" />
              </Link>
            </Button>

            <div className="flex items-center space-x-2 border-l pl-4">
  <Button variant="ghost" size="sm" asChild>
    <Link href={`/${locale}/login`}>
      {t('cta.memberLogin')}
    </Link>
  </Button>
  <LanguageSwitcher />
  <ThemeToggle />
</div>
          </div>

          {/* Mobile Menu */}
          <div className="flex lg:hidden items-center space-x-2">
            <LanguageSwitcher />
            <ThemeToggle />
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Icon name="menu" className="h-6 w-6" />
                  <span className="sr-only">{t('nav.toggleMenu')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <VisuallyHidden>
    <SheetTitle>{t('nav.toggleMenu')}</SheetTitle>
  </VisuallyHidden>
                <div className="flex flex-col h-full">
                  {/* Mobile Navigation */}
                  <nav className="flex-1 py-6">
                    <div className="space-y-1">
                      <Link
                        href={`/${locale}/about`}
                        className="flex items-center px-3 py-3 text-base font-medium rounded-md hover:bg-accent"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon name="home" className="h-5 w-5 mr-3" />
                        {t('nav.about')}
                      </Link>

                      {/* Programs Section */}
                      <div className="space-y-2">
                        <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                          {t('nav.programs')}
                        </div>
                        {programs.map((program) => (
                          <Link
                            key={program.href}
                            href={program.href}
                            className="flex items-center px-6 py-2 text-sm rounded-md hover:bg-accent"
                            onClick={() => setIsOpen(false)}
                          >
                            {program.icon}
                            <span className="ml-3">{program.title}</span>
                          </Link>
                        ))}
                      </div>

                      <Link
                        href={`/${locale}/impact`}
                        className="flex items-center px-3 py-3 text-base font-medium rounded-md hover:bg-accent"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon name='target' className="h-5 w-5 mr-3" />
                        {t('nav.impact')}
                      </Link>

                      <Link
                        href={`/${locale}/get-involved`}
                        className="flex items-center px-3 py-3 text-base font-medium rounded-md hover:bg-accent"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon name="users" className="h-5 w-5 mr-3" />
                        {t('nav.getInvolved')}
                      </Link>

                      <Link
                        href={`/${locale}/news`}
                        className="flex items-center px-3 py-3 text-base font-medium rounded-md hover:bg-accent"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon name="bookOpen" className="h-5 w-5 mr-3" />
                        {t('nav.news')}
                      </Link>

                      <Link
                        href={`/${locale}/contact`}
                        className="flex items-center px-3 py-3 text-base font-medium rounded-md hover:bg-accent"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon name="phone" className="h-5 w-5 mr-3" />
                        {t('nav.contact')}
                      </Link>
                    </div>
                  </nav>

                  {/* Mobile CTAs */}
                  <div className="border-t pt-6 space-y-3">
                    <Button size="lg" className="w-full" asChild>
                      <Link
                        href={`/${locale}/get-involved/donate`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon name="heart" className="h-5 w-5 mr-2" />
                        {t('cta.donate')}
                      </Link>
                    </Button>
                    
                    <Button size="lg" variant="outline" className="w-full" asChild>
                      <Link
                        href={`/${locale}/get-involved/volunteer`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon name="users" className="h-5 w-5 mr-2" />
                        {t('cta.volunteer')}
                      </Link>
                    </Button>
                    <Link
  href={`/${locale}/login`}
  className="flex items-center px-3 py-3 text-base font-medium rounded-md hover:bg-accent border-b"
  onClick={() => setIsOpen(false)}
>
  <Icon name="login" className="h-5 w-5 mr-3 text-primary" />
  {t('cta.memberLogin')}
</Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}