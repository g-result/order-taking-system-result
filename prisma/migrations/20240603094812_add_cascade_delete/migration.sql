-- DropForeignKey
ALTER TABLE "ProductRecommendTag" DROP CONSTRAINT "ProductRecommendTag_recommendTagId_fkey";

-- AddForeignKey
ALTER TABLE "ProductRecommendTag" ADD CONSTRAINT "ProductRecommendTag_recommendTagId_fkey" FOREIGN KEY ("recommendTagId") REFERENCES "RecommendTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
