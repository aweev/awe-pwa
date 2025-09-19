// app/api/onboarding/complete-step/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from '@/lib/utils/api-handler';
import { onboardingService } from '@/lib/onboarding/onboarding.service';

const completeStepSchema = z.object({
  stepId: z.number().int(),
  data: z.record(z.string(), z.any()).optional().default({}),
});

export const POST = createApiHandler(
  async (_req, { session, body }) => {
    const { stepId, data } = body;
    const progress = await onboardingService.completeStep(session!.sub, stepId, data);
    return NextResponse.json(progress);
  },
  {
    auth: 'authenticated',
    bodySchema: completeStepSchema,
  }
);