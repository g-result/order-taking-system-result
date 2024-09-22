/*
  Warnings:

  - You are about to drop the column `isApproved` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('APPLYING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isApproved",
ADD COLUMN     "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'APPLYING';
