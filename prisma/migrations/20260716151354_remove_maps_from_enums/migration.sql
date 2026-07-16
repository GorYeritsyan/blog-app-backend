/*
  Warnings:

  - The values [user,assistant,system] on the enum `AiMessageRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [ok,error] on the enum `AiMessageStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AiMessageRole_new" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');
ALTER TABLE "AiMessage" ALTER COLUMN "role" TYPE "AiMessageRole_new" USING ("role"::text::"AiMessageRole_new");
ALTER TYPE "AiMessageRole" RENAME TO "AiMessageRole_old";
ALTER TYPE "AiMessageRole_new" RENAME TO "AiMessageRole";
DROP TYPE "public"."AiMessageRole_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "AiMessageStatus_new" AS ENUM ('OK', 'ERROR');
ALTER TABLE "public"."AiMessage" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "AiMessage" ALTER COLUMN "status" TYPE "AiMessageStatus_new" USING ("status"::text::"AiMessageStatus_new");
ALTER TYPE "AiMessageStatus" RENAME TO "AiMessageStatus_old";
ALTER TYPE "AiMessageStatus_new" RENAME TO "AiMessageStatus";
DROP TYPE "public"."AiMessageStatus_old";
ALTER TABLE "AiMessage" ALTER COLUMN "status" SET DEFAULT 'OK';
COMMIT;

-- AlterTable
ALTER TABLE "AiMessage" ALTER COLUMN "status" SET DEFAULT 'OK';
