/*
  Warnings:

  - The values [DECLINED] on the enum `FriendRequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FriendRequestStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
ALTER TABLE "public"."FriendRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "FriendRequest" ALTER COLUMN "status" TYPE "FriendRequestStatus_new" USING ("status"::text::"FriendRequestStatus_new");
ALTER TYPE "FriendRequestStatus" RENAME TO "FriendRequestStatus_old";
ALTER TYPE "FriendRequestStatus_new" RENAME TO "FriendRequestStatus";
DROP TYPE "public"."FriendRequestStatus_old";
ALTER TABLE "FriendRequest" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
