/*
  Warnings:

  - Added the required column `salesFormat` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "salesFormat" TEXT NOT NULL,
ALTER COLUMN "tax" DROP NOT NULL;
