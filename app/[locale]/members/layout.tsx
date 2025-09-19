// app/[locale]/members/layout.tsx
import { MembersHeader } from '@/components/layout/members/members-header'
import { MembersSidebar } from '@/components/layout/members/members-sidebar'
import { AuthenticatedProviders } from '@/app/providers';
import { getBrandConfig } from '@/lib/utils/brand';

export default async function MembersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const brandConfig = await getBrandConfig();
  return (
    <AuthenticatedProviders initialBrandConfig={brandConfig}>
    <div className="min-h-screen bg-background">
      <MembersHeader />
      <div className="flex">
        <MembersSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
    </AuthenticatedProviders>
  )
}