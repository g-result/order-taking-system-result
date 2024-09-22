/*
  Warnings:

  - Made the column `pricingType` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.
本番環境のデータを手動で更新して対応。
今後は、なるべくローカルで確認してから反映させる
*/
-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "pricingType" SET NOT NULL;
