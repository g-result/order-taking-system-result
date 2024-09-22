/*
  Warnings:

  - Added the required column `nameKana` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transferNameKana` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "addressLine" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "nameKana" TEXT NOT NULL,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "prefecture" TEXT,
ADD COLUMN     "transferNameKana" TEXT NOT NULL;
