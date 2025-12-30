/*
  Warnings:

  - Added the required column `stripeChargeId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "stripeChargeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "OrderReceipt" (
    "id" TEXT NOT NULL,
    "receiptUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "OrderReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderReceipt_orderId_key" ON "OrderReceipt"("orderId");

-- AddForeignKey
ALTER TABLE "OrderReceipt" ADD CONSTRAINT "OrderReceipt_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
