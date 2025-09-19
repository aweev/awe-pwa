// components/members/members-sidebar.tsx
"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { navigationItems, bottomNavItems } from '@/lib/nav/members'
import { useNavState } from '@/hooks/use-nav-state'
import { Icon } from '@/components/ui/icon'
import { useNotifications } from '@/hooks/use-notifications'

export function MembersSidebar({ inSheet }: { inSheet?: boolean }) {
  const pathname = usePathname()
  const t = useTranslations('MembersNav')
  const { collapsed, toggleCollapsed } = useNavState()
  const unread = useNotifications((s) => s.items.filter((i) => !i.read).length)

  const isActive = (href?: string) => (href ? pathname.startsWith(href) : false)

  const NavItem = ({ item, level = 0 }: { item: any; level?: number }) => {
    const active = isActive(item.href)
    const base = cn(
      'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition',
      level > 0 && 'ml-4 text-xs',
      active
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    )

    if (collapsed && !inSheet) {
      return (
        <Link href={item.href || '#'} title={t(item.labelKey)} className={cn(base, 'justify-center')}>
          <Icon name={item.icon} className="h-5 w-5" />
        </Link>
      )
    }

    return (
      <Link href={item.href || '#'} className={base}>
        <Icon name={item.icon} className="h-5 w-5" />
        <span className="flex-1">{t(item.labelKey)}</span>
        {item.id === 'profile' && unread > 0 && (
          <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
            {unread > 9 ? '9+' : unread}
          </Badge>
        )}
      </Link>
    )
  }

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-muted/30',
        inSheet ? 'w-full' : collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center border-b px-4 py-3', collapsed && !inSheet && 'justify-center')}>
        {!collapsed || inSheet ? (
          <>
            <span className="text-sm font-semibold">{t('title')}</span>
            {!inSheet && (
              <button onClick={toggleCollapsed} className="ml-auto">
                <Icon name="chevronLeft" className="h-4 w-4" />
              </button>
            )}
          </>
        ) : (
          <button onClick={toggleCollapsed}>
            <Icon name="chevronRight" className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Impact stats */}
      {(!collapsed || inSheet) && (
        <div className="grid grid-cols-3 gap-2 border-b p-3 text-center text-xs">
          <div>
            <p className="font-bold text-primary">42</p>
            <p className="text-muted-foreground">Hours</p>
          </div>
          <div>
            <p className="font-bold text-primary">8</p>
            <p className="text-muted-foreground">Events</p>
          </div>
          <div>
            <p className="font-bold text-primary">156</p>
            <p className="text-muted-foreground">Impact</p>
          </div>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 space-y-1 p-2">
        {navigationItems.map((i) => (
          <NavItem key={i.id} item={i} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="border-t p-2">
        {bottomNavItems.map((i) => (
          <NavItem key={i.id} item={i} />
        ))}
      </div>
    </aside>
  )
}