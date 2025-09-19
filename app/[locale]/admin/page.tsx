// app/[locale]/admin/page.tsx
import { useTranslations } from 'next-intl'
import { AdminDashboard } from '@/components/features/admin/admin-dashboard'

export default function AdminDashboardPage() {
  const t = useTranslations('AdminDashboard')
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>
      <AdminDashboard />
    </div>
  )
}