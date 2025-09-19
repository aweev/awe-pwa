// components/layout/admin/admin-sidebar.tsx
"use client";

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

export function AdminSidebar() {
  const t = useTranslations('AdminSidebar')
  const locale = useLocale()
  const pathname = usePathname()
  
  const navigation = [
    {
      name: t('nav.dashboard'),
      href: `/${locale}/admin`,
      icon: 'home',
      current: pathname === `/${locale}/admin`,
    },
    {
      name: t('nav.contentManagement'),
      href: `/${locale}/admin/content`,
      icon: 'fileText',
      current: pathname.startsWith(`/${locale}/admin/content`),
    },
    {
      name: t('nav.userManagement'),
      href: `/${locale}/admin/users`,
      icon: 'users',
      current: pathname.startsWith(`/${locale}/admin/users`),
    },
    {
      name: t('nav.partnerships'),
      href: `/${locale}/admin/partnerships`,
      icon: 'handshake',
      current: pathname.startsWith(`/${locale}/admin/partnerships`),
    },
    {
      name: t('nav.analytics'),
      href: `/${locale}/admin/analytics`,
      icon: 'barChart3',
      current: pathname.startsWith(`/${locale}/admin/analytics`),
    },
  ]

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r">
      <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                item.current
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors'
              )}
            >
              <Icon
                name={item.icon as any}
                className={cn(
                  item.current 
                    ? 'text-primary-foreground' 
                    : 'text-muted-foreground group-hover:text-accent-foreground',
                  'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                )}
              />
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="flex-shrink-0 px-2">
          <Link
            href={`/${locale}/admin/settings`}
            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Icon name="settings" className="mr-3 h-5 w-5" />
            {t('settings')}
          </Link>
        </div>
      </div>
    </div>
  )
}
