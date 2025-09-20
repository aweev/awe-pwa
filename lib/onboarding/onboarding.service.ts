// lib/onboarding/onboarding.service.ts
import { prisma } from "@/lib/db";
// Add UserOnboarding to the import
import { Prisma, UserOnboarding } from "@prisma/client"; 
import { ONBOARDING_STEPS } from "./onboarding.steps";
import { buildProgress } from "./onboarding.progress";
import type { OnboardingProgress, OnboardingStep } from "./onboarding.types";

export const onboardingService = {
  /**
   * Finds a user's onboarding record, or creates it if it doesn't exist.
   * This is the canonical way to get a user's onboarding status.
   * @param userId The ID of the user.
   * @returns The user's UserOnboarding record from the database.
   */
  async getOrCreate(userId: string): Promise<UserOnboarding> {
    const existing = await prisma.userOnboarding.findUnique({ where: { userId } });

    // If the record already exists, just return it.
    if (existing) {
      return existing;
    }

    // If it doesn't exist, create it and return the newly created record.
    const newOnboardingRecord = await prisma.userOnboarding.create({
      data: {
        userId,
        steps: ONBOARDING_STEPS as unknown as Prisma.JsonArray,
      },
    });

    return newOnboardingRecord;
  },

  // Your old start method is no longer needed.
  // You can delete it or keep it for other purposes, but getOrCreate is superior.
  /*
  async start(userId: string): Promise<void> { ... }
  */

  async getProgress(userId: string): Promise<OnboardingProgress> {
    // We can use our new robust method here too!
    const record = await this.getOrCreate(userId);
    // The 'as' cast is safe here because we control the data structure.
    return buildProgress(record.steps as unknown as OnboardingStep[]);
  },

  async completeStep(userId: string, stepId: number, data: Record<string, unknown>): Promise<OnboardingProgress> {
    // And here as well, ensuring a record always exists before proceeding.
    const record = await this.getOrCreate(userId);

    const currentSteps = record.steps as unknown as OnboardingStep[];

    // ... rest of the completeStep function remains the same ...
    const completedStep = currentSteps.find(step => step.id === stepId);
    if (completedStep?.name === 'profile') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: typeof data.firstName === 'string' ? data.firstName : undefined,
          lastName: typeof data.lastName === 'string' ? data.lastName : undefined,
          username: typeof data.username === 'string' ? data.username : undefined,
        },
      });
    }

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
        completedAt: progress.isCompleted && !record.isCompleted ? new Date() : null,
      },
    });

    return progress;
  },
};