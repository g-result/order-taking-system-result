/*
  Warnings:

  - Added the required column `publishedEndAt` to the `News` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "News" ADD COLUMN     "publishedEndAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
