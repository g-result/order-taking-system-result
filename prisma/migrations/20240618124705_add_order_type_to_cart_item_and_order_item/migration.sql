-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('Order', 'Request');

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "orderType" "OrderType" NOT NULL DEFAULT 'Order';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "orderType" "OrderType" NOT NULL DEFAULT 'Order';
