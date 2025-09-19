/*
  Warnings:

  - You are about to drop the column `userame` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "userame",
ADD COLUMN     "username" TEXT;
