/*
  Warnings:

  - You are about to drop the column `productId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `orderNumber` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to drop the column `categoryId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `displayOrder` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ProductCategory` table. All the data in the column will be lost.
  - You are about to drop the column `displayOrder` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ProductTag` table. All the data in the column will be lost.
  - You are about to drop the column `paymentAccount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `paymentName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Announcement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderMemo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrintJob` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductInventory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductTagRelation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserApproval` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserNotificationSetting` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productVariantId` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitType` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origin` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rank` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `ProductCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `ProductCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `ProductTag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tagId` to the `ProductTag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleType` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transferName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "RankEnum" AS ENUM ('ONE', 'TWO', 'THREE', 'FOUR', 'FIVE');

-- CreateEnum
CREATE TYPE "ProductUnitType" AS ENUM ('WHOLE', 'HALF_BODY', 'QUATER_BACK', 'QUATER_BELLY');

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "OrderHistory" DROP CONSTRAINT "OrderHistory_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "OrderMemo" DROP CONSTRAINT "OrderMemo_orderId_fkey";

-- DropForeignKey
ALTER TABLE "PrintJob" DROP CONSTRAINT "PrintJob_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ProductInventory" DROP CONSTRAINT "ProductInventory_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductTagRelation" DROP CONSTRAINT "ProductTagRelation_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductTagRelation" DROP CONSTRAINT "ProductTagRelation_tagId_fkey";

-- DropForeignKey
ALTER TABLE "UserApproval" DROP CONSTRAINT "UserApproval_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserNotificationSetting" DROP CONSTRAINT "UserNotificationSetting_userId_fkey";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "productId",
ADD COLUMN     "productVariantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "orderNumber",
DROP COLUMN "status",
ADD COLUMN     "memo" TEXT,
ADD COLUMN     "totalAmount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "productId",
ADD COLUMN     "productName" TEXT NOT NULL,
ADD COLUMN     "unitType" "ProductUnitType" NOT NULL,
ALTER COLUMN "price" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "categoryId",
DROP COLUMN "displayOrder",
DROP COLUMN "isActive",
DROP COLUMN "price",
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRecommended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "origin" TEXT NOT NULL,
ADD COLUMN     "rank" "RankEnum" NOT NULL;

-- AlterTable
ALTER TABLE "ProductCategory" DROP COLUMN "name",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "productId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "displayOrder",
DROP COLUMN "imageUrl",
ADD COLUMN     "url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductTag" DROP COLUMN "name",
ADD COLUMN     "productId" INTEGER NOT NULL,
ADD COLUMN     "tagId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "paymentAccount",
DROP COLUMN "paymentName",
ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pushNotificationEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "roleType" "RoleType" NOT NULL,
ADD COLUMN     "shopName" TEXT NOT NULL,
ADD COLUMN     "transferName" TEXT NOT NULL;

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "Announcement";

-- DropTable
DROP TABLE "OrderHistory";

-- DropTable
DROP TABLE "OrderMemo";

-- DropTable
DROP TABLE "PrintJob";

-- DropTable
DROP TABLE "ProductInventory";

-- DropTable
DROP TABLE "ProductTagRelation";

-- DropTable
DROP TABLE "UserApproval";

-- DropTable
DROP TABLE "UserNotificationSetting";

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "iconUrl" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendTag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductRecommendTag" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "recommendTagId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductRecommendTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "unitType" "ProductUnitType" NOT NULL,
    "price" INTEGER NOT NULL,
    "tax" INTEGER NOT NULL,
    "discountedPrice" INTEGER,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RecommendTag_name_key" ON "RecommendTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTag" ADD CONSTRAINT "ProductTag_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTag" ADD CONSTRAINT "ProductTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRecommendTag" ADD CONSTRAINT "ProductRecommendTag_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRecommendTag" ADD CONSTRAINT "ProductRecommendTag_recommendTagId_fkey" FOREIGN KEY ("recommendTagId") REFERENCES "RecommendTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
