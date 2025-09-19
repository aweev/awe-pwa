// lib/onboarding/onboarding.service.ts
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { ONBOARDING_STEPS } from "./onboarding.steps";
import { buildProgress } from "./onboarding.progress";
import type { OnboardingProgress, OnboardingStep } from "./onboarding.types";

export const onboardingService = {
  async start(userId: string): Promise<void> {
    const existing = await prisma.userOnboarding.findUnique({ where: { userId } });
    if (existing) return;

    await prisma.userOnboarding.create({
      data: {
        userId,
        steps: ONBOARDING_STEPS as unknown as Prisma.JsonArray,
      },
    });
  },

  async getProgress(userId: string): Promise<OnboardingProgress> {
    const record = await prisma.userOnboarding.findUnique({ where: { userId } });
    if (!record) {
      // This is a failsafe. If for some reason the record doesn't exist, create it.
      await this.start(userId);
      return buildProgress(ONBOARDING_STEPS);
    }
    // The 'as' cast is safe here because we control the data structure.
    return buildProgress(record.steps as unknown as OnboardingStep[]);
  },

  async completeStep(userId: string, stepId: number, data: Record<string, unknown>): Promise<OnboardingProgress> {
    const record = await prisma.userOnboarding.findUnique({ where: { userId } });
    if (!record) throw new Error("Onboarding not started for this user.");

    const currentSteps = record.steps as unknown as OnboardingStep[];

    const completedStep = currentSteps.find(step => step.id === stepId);
    if (completedStep?.name === 'profile') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          // Type-safe extraction of profile data
          firstName: typeof data.firstName === 'string' ? data.firstName : undefined,
          lastName: typeof data.lastName === 'string' ? data.lastName : undefined,
          username: typeof data.username === 'string' ? data.username : undefined,
        },
      });
    }

    // Update the step in the JSON blob
    const nextSteps = currentSteps.map(step => {
      if (step.id === stepId) {
        return { ...step, completed: true, data };
      }
      return step;
    });

    const progress = buildProgress(nextSteps);

    await prisma.userOnboarding.update({
      where: { userId },
      data: {
        steps: nextSteps as unknown as Prisma.JsonArray,
        isCompleted: progress.isCompleted,
        // Set completion date only on the final transition to completed
        completedAt: progress.isCompleted && !record.isCompleted ? new Date() : null,
      },
    });

    return progress;
  },
};