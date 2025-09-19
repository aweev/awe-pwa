// app/[locale]/test/page.tsx
export default async function TestPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Test Page Works!</h1>
      <p>Locale: {locale}</p>
      <p>If you can see this, basic routing is working.</p>
    </div>
  );
}