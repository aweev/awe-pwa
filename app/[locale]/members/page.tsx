// app/[locale]/members/page.tsx
import { useTranslations } from 'next-intl'
import { MembersDashboard } from '@/components/features/members/members-dashboard'

export default function MembersDashboardPage() {
  const t = useTranslations('MembersDashboard')
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>
      <MembersDashboard />
    </div>
  )
}