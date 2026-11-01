-- Link the single demo vehicle-owner login to an explicit Owner record.

ALTER TABLE "users"
  ADD COLUMN "ownerId" TEXT;

CREATE INDEX "users_ownerId_idx" ON "users"("ownerId");

ALTER TABLE "users"
  ADD CONSTRAINT "users_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;