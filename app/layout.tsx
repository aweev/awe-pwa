// app/layout.tsx
import type { Viewport, Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';

export const metadata: Metadata = {
  title: 'AWE e.V.',
  description: 'A community of change-makers dedicated to dignified growth and global impact.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F9F8F6' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0B' },
  ],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${lora.variable} antialiased theme-transition`}>
        {children}
      </body>
    </html>
  )
}