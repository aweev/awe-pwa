// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import {
    sendVerificationEmail,
    sendPasswordResetEmail,
} from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        // List all Inngest functions
        sendVerificationEmail,
        sendPasswordResetEmail,
    ],
});