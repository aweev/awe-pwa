
// app/[locale]/(public)/page.tsx
import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('HomePage')
  
  return (
    <div>
      <h1>{t('hero.headlinePrimary')}</h1>
      {/* Your existing homepage content */}
    </div>
  )
}