// app/api/onboarding/progress/route.ts

import { onboardingService } from "@/lib/onboarding/onboarding.service";
import { createApiHandler } from "@/lib/utils/api-handler";
import { NextResponse } from "next/server";


export const GET = createApiHandler(
    async (_req, { session }) => {
        const progress = await onboardingService.getProgress(session!.sub);
        return NextResponse.json({ progress });
    },
    {
        auth: 'authenticated',
    }
);