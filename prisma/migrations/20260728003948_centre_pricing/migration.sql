-- Rename consultation fee to kit price (consultations are now free;
-- medicine kits are priced per centre).
ALTER TABLE "Branch" RENAME COLUMN "consultationFee" TO "kitPriceInr";

-- Products can be retired from the storefront without breaking old orders.
ALTER TABLE "Product" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- Orders record the fulfilment centre chosen at checkout.
ALTER TABLE "Order" ADD COLUMN "branchId" TEXT;
ALTER TABLE "Order" ADD CONSTRAINT "Order_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
