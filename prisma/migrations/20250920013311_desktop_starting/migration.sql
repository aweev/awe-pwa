/*
  Warnings:

  - You are about to drop the column `id_token` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `scope` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `session_state` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `token_type` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `PasswordReset` table. All the data in the column will be lost.
  - You are about to drop the column `tokenHash` on the `PasswordReset` table. All the data in the column will be lost.
  - You are about to drop the column `used` on the `PasswordReset` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastLogin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `memberType` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `onboardingComplete` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `EmailVerification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AuditLogToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_sessions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[token]` on the table `PasswordReset` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `provider` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `PasswordReset` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EmailVerification" DROP CONSTRAINT "EmailVerification_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AuditLogToUser" DROP CONSTRAINT "_AuditLogToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_AuditLogToUser" DROP CONSTRAINT "_AuditLogToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_sessions" DROP CONSTRAINT "user_sessions_userId_fkey";

-- DropIndex
DROP INDEX "public"."PasswordReset_tokenHash_key";

-- DropIndex
DROP INDEX "public"."VerificationToken_userId_token_key";

-- AlterTable
ALTER TABLE "public"."Account" DROP COLUMN "id_token",
DROP COLUMN "scope",
DROP COLUMN "session_state",
DROP COLUMN "token_type",
DROP COLUMN "type",
DROP COLUMN "provider",
ADD COLUMN     "provider" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."AuditLog" DROP COLUMN "userAgent";

-- AlterTable
ALTER TABLE "public"."PasswordReset" DROP COLUMN "createdAt",
DROP COLUMN "tokenHash",
DROP COLUMN "used",
ADD COLUMN     "token" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "active",
DROP COLUMN "lastLogin",
DROP COLUMN "memberType",
DROP COLUMN "onboardingComplete",
DROP COLUMN "role",
ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "public"."EmailVerification";

-- DropTable
DROP TABLE "public"."_AuditLogToUser";

-- DropTable
DROP TABLE "public"."user_sessions";

-- CreateTable
CREATE TABLE "public"."UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceInfo" JSONB,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_sessionToken_key" ON "public"."UserSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "public"."PasswordReset"("token");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- AddForeignKey
ALTER TABLE "public"."UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
