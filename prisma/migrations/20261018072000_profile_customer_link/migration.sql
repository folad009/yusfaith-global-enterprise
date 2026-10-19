-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN "customerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_customerId_key" ON "UserProfile"("customerId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
