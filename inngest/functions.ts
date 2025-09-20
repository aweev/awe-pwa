// inngest/functions.ts

import { inngest } from "./client"; // Your Inngest client
import { authService } from "@/lib/auth/auth.service";
import type { Locale } from "@/lib/i18n";

/**
 * Function to send a verification email to a new user.
 * This is triggered by the 'auth/user.registered' event sent from your auth service.
 */
export const sendVerificationEmail = inngest.createFunction(
    { id: "send-verification-email", name: "Send User Verification Email" },
    { event: "auth/user.registered" },
    async ({ event, step }) => {
        const { email, locale } = event.data as { email: string; locale: Locale };

        await step.run("send-verification-email-step", async () => {
            // We call the authService method responsible for creating the token and sending the email.
            // This keeps the logic centralized in the authService.
            await authService.createAndSendVerificationToken(email, locale);
        });

        return { message: `Verification email sent to ${email}` };
    }
);

/**
 * Function to send a password reset email.
 * This is triggered by the 'auth/password.reset_requested' event.
 */
export const sendPasswordResetEmail = inngest.createFunction(
    { id: "send-password-reset-email", name: "Send Password Reset Email" },
    { event: "auth/password.reset_requested" },
    async ({ event, step }) => {
        const { email, locale } = event.data as { email: string; locale: Locale };

        await step.run("send-password-reset-email-step", async () => {
            // We call the authService method responsible for this logic.
            await authService.createAndSendPasswordResetToken(email, locale);
        });

        return { message: `Password reset email sent to ${email}` };
    }
);

// You can add more functions here as your application grows.
// For example, a function to handle user deactivation, data cleanup, etc.