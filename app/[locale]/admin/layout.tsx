// app/[locale]/admin/layout.tsx
import { AdminHeader } from '@/components/layout/admin/admin-header'
import { AdminSidebar } from '@/components/layout/admin/admin-sidebar'
import { AuthenticatedProviders } from '@/app/providers';
import { getBrandConfig } from '@/lib/utils/brand';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const brandConfig = await getBrandConfig();
  return (
    <AuthenticatedProviders initialBrandConfig={brandConfig}>
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
    </AuthenticatedProviders>
  )
}