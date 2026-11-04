-- Backfill the owner registry used by admin NID lookup.
-- The original production seed created only the login-linked owner.

INSERT INTO "owners" ("id", "nid", "fullName", "isActive", "createdAt", "updatedAt")
VALUES
  ('owner-1000000001', '1000000001', 'Rahim Uddin', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000002', '1000000002', 'Karim Hossain', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000003', '1000000003', 'Nadia Begum', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000004', '1000000004', 'Jalal Ahmed', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000005', '1000000005', 'Faruk Miah', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000006', '1000000006', 'Monir Chowdhury', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000007', '1000000007', 'Roksana Islam', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000008', '1000000008', 'Tanvir Rahman', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000009', '1000000009', 'Mina Transport', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000010', '1000000010', 'Selim Transport Ltd', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000011', '1000000011', 'Alam Brothers Logistics', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000012', '1000000012', 'Rapid Cargo Ltd', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000013', '1000000013', 'Green Line Paribahan', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000014', '1000000014', 'Ena Transport', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000015', '1000000015', 'Salma Akter', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000016', '1000000016', 'Shahidul Khan', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000017', '1000000017', 'Anwar Logistics', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000018', '1000000018', 'Rubel Ahmed', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000019', '1000000019', 'Habib Miah', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-1000000020', '1000000020', 'Dhaka Express', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-2000000001', '2000000001', 'Ministry of Finance', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-2000000002', '2000000002', 'Ministry of Health', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-2000000003', '2000000003', 'Ministry of Education', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-2000000004', '2000000004', 'Bangladesh Police', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('owner-2000000005', '2000000005', 'Bangladesh Army', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("nid") DO UPDATE
SET "fullName" = EXCLUDED."fullName",
    "isActive" = true,
    "updatedAt" = CURRENT_TIMESTAMP;

UPDATE "users"
SET "ownerId" = (SELECT "id" FROM "owners" WHERE "nid" = '1000000001'),
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "email" = 'owner@fuel.bd';

UPDATE "vehicles" AS v
SET "ownerId" = o."id"
FROM "owners" AS o
WHERE v."ownerName" = o."fullName";
