import { NextRequest, NextResponse } from "next/server";
import {prisma }from "@/lib/db";
import { AUTH_CONFIG } from "@/lib/auth/auth.config";
import { hashTokenForDb } from "@/lib/auth/auth.utils";

export async function GET(req: NextRequest) {
  if (process.env.ENABLE_E2E_HELPERS !== "true") return NextResponse.json({error:"disabled"}, { status: 403});
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) return NextResponse.json({ error: "no user" }, { status: 404 });

  const rec = await prisma.emailVerification.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" }});
  if (!rec) return NextResponse.json({ error: "no token" }, { status: 404 });

  // Define a type that includes the optional rawToken property
  type EmailVerificationWithRawToken = typeof rec & { rawToken?: string };

  // We cannot return raw token (we store only hash). During tests you can store the raw token in an insecure test field,
  // OR modify createEmailVerificationToken during tests to also store `rawToken` field in a test-only table.
  // For convenience in test environment, we can add rawToken to DB when ENABLE_E2E_HELPERS is enabled.
  // Here, we attempt to return rec['rawToken'] if present.
  const raw = (rec as EmailVerificationWithRawToken).rawToken;
  if (!raw) return NextResponse.json({ error: "raw not available" }, { status: 404 });
  return NextResponse.json({ token: raw });
}
