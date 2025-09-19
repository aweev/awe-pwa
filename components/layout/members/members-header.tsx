// components/layout/members/members-header.tsx
"use client";

import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BrandLogo } from '@/components/common/brand-logo'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { Icon } from '@/components/ui/icon'

export function MembersHeader() {
  const t = useTranslations('MembersHeader')
  const locale = useLocale()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-6">
          <BrandLogo 
            href={`/${locale}/members`} 
            variant="members"
            brandName={t('brandName')} 
          />
          
          <div className="relative">
            <Icon name="search" className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              className="pl-8 w-64"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <LanguageSwitcher variant="compact" />
          <ThemeToggle variant="simple" />
          
          <Button variant="outline" size="sm">
            <Icon name="user" className="h-4 w-4 mr-2" />
            {t('myAccount')}
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