// app/[locale]/(public)/layout.tsx
import { PublicHeader } from '@/components/layout/public/header'
import { PublicFooter } from '@/components/layout/public/footer'
import { PublicProviders } from '@/app/providers'; 
import { getBrandConfig } from '@/lib/utils/brand';

export default async function PublicLayout({
  children,
  params, 
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const brandConfig = await getBrandConfig();

  return (
    <PublicProviders initialBrandConfig={brandConfig}>
      <div className="flex flex-col min-h-screen">
        <PublicHeader locale={locale} />
        <main className="flex-grow">{children}</main>
        <PublicFooter />
      </div>
    </PublicProviders>
  );
}