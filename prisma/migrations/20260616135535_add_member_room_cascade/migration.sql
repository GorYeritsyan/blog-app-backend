-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_roomId_fkey";

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
