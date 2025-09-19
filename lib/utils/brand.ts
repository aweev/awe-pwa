// lib/utils/brand.ts
import type { BrandConfig } from '@/hooks/use-brand-config';

export async function getBrandConfig(): Promise<BrandConfig | undefined> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/brand-config`, { 
      next: { revalidate: 3600 } 
    });
    if (!res.ok) return undefined;
    return res.json();
  } catch (error) {
    console.error("Server fetch for BrandConfig failed:", error);
    return undefined;
  }
}