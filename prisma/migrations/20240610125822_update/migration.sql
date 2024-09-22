/*
  Warnings:

  - Added the required column `pricingType` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "pricingType" TEXT NOT NULL,
ADD COLUMN     "separateBackBelly" BOOLEAN NOT NULL DEFAULT false;
