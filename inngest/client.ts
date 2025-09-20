// inngest/client.ts
import { Inngest } from 'inngest';
import { serve } from 'inngest/next';
import { authService } from '@/lib/auth/auth.service';

export const inngest = new Inngest({ id: 'awe-pwa' });

const sendVerificationEmail = inngest.createFunction(
    { id: 'send-verification-email', retries: 3 },
    { event: 'auth/user.registered' },
    async ({ event }) => {
        const { email, locale } = event.data;
        await authService.createAndSendVerificationToken(email, locale);
        return { message: `Verification email job for ${email} completed.` };
    }
);

// --- ADD THIS NEW FUNCTION ---
const sendPasswordResetEmail = inngest.createFunction(
    { id: 'send-password-reset-email', retries: 3 },
    { event: 'auth/password.reset_requested' },
    async ({ event }) => {
        const { email, locale } = event.data;
        await authService.createAndSendPasswordResetToken(email, locale);
        return { event, body: `Password reset job for ${email} completed.` };
    }
);

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        sendVerificationEmail,
        sendPasswordResetEmail, // Add the new function here
    ],
});