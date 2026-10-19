/*
  Warnings:

  - Added the required column `branchId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `Quote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN "branchId" TEXT;
ALTER TABLE "Quote" ADD COLUMN "branchId" TEXT;

UPDATE "Order" AS document
SET "branchId" = branch.id
FROM "Branch" AS branch
WHERE document."branchId" IS NULL
  AND branch.code = 'LOS-01';

UPDATE "Quote" AS document
SET "branchId" = branch.id
FROM "Branch" AS branch
WHERE document."branchId" IS NULL
  AND branch.code = 'LOS-01';

ALTER TABLE "Order" ALTER COLUMN "branchId" SET NOT NULL;
ALTER TABLE "Quote" ALTER COLUMN "branchId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Order_branchId_orderDate_idx" ON "Order"("branchId", "orderDate");

-- CreateIndex
CREATE INDEX "Quote_branchId_createdAt_idx" ON "Quote"("branchId", "createdAt");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
