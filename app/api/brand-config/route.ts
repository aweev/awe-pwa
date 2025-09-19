// app/api/brand-config/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createApiHandler } from '@/lib/utils/api-handler';
//import { ADMIN_ROLES } from '@/lib/auth/roles';
import z from 'zod';

const brandConfigSchema = z.object({
  name: z.string(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
  }),
  social: z.record(z.string(), z.string().url().optional()),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

// GET handler to fetch the config from the database
export const GET = createApiHandler(
  async () => {
    const config = await prisma.brandConfig.findUnique({
      where: { singleton: 'main' },
    });
    
    if (!config) {
      return NextResponse.json({ error: "Brand configuration not found." }, { status: 404 });
    }
    
    return NextResponse.json(config);
  },
  {
    auth: 'public', // No authentication required for GET
    limiter: 'global',
  }
);

// PUT handler to update the config
export const PUT = createApiHandler(
  async (_req, { body: newConfigData }) => {
    const updatedConfig = await prisma.brandConfig.update({
      where: { singleton: 'main' },
      data: {
        name: newConfigData.name,
        // Prisma's JSON fields can accept objects directly
        colors: newConfigData.colors,
        social: newConfigData.social,
        contact: newConfigData.contact,
      },
    });

    return NextResponse.json(updatedConfig);
  },
  {
    auth: 'admin', // <-- THIS IS THE KEY! It enforces our role check.
    // Alternatively, more specific:
    // auth: 'authenticated',
    // allowedRoles: ADMIN_ROLES,
    bodySchema: brandConfigSchema.partial(), // Ensure the body matches our schema
    limiter: 'global',
  }
);