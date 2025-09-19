// components/layout/admin/admin-header.tsx
"use client";

import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/common/brand-logo'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { Icon } from '@/components/ui/icon'

export function AdminHeader() {
  const t = useTranslations('AdminHeader')
  const locale = useLocale()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <BrandLogo 
            href={`/${locale}/admin`} 
            variant="admin"
            brandName={t('brandName')} 
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <LanguageSwitcher variant="compact" />
          <ThemeToggle variant="simple" />
          
          <Button variant="outline" size="sm">
            <Icon name="user" className="h-4 w-4 mr-2" />
            {t('adminAccount')}
          </Button>
          
          <Button variant="ghost" size="sm">
            <Icon name="logOut" className="h-4 w-4 mr-2" />
            {t('logout')}
          </Button>
        </div>
      </div>
    </header>
  )
}