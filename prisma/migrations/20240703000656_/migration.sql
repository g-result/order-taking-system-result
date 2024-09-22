/*
  Warnings:

  - The values [QUATER] on the enum `ProductUnitType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProductUnitType_new" AS ENUM ('WHOLE', 'HALF_BODY', 'QUATER_BACK', 'QUATER_BELLY');
ALTER TABLE "ProductVariant" ALTER COLUMN "unitType" TYPE "ProductUnitType_new" USING ("unitType"::text::"ProductUnitType_new");
ALTER TABLE "OrderItem" ALTER COLUMN "unitType" TYPE "ProductUnitType_new" USING ("unitType"::text::"ProductUnitType_new");
ALTER TYPE "ProductUnitType" RENAME TO "ProductUnitType_old";
ALTER TYPE "ProductUnitType_new" RENAME TO "ProductUnitType";
DROP TYPE "ProductUnitType_old";
COMMIT;
