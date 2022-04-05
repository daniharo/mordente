/*
  Warnings:

  - Made the column `ensembleId` on table `Song` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_membershipId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_ensembleId_fkey";

-- DropForeignKey
ALTER TABLE "EventAssignedUser" DROP CONSTRAINT "EventAssignedUser_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventAssignedUser" DROP CONSTRAINT "EventAssignedUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "InstrumentGroup" DROP CONSTRAINT "InstrumentGroup_ensembleId_fkey";

-- DropForeignKey
ALTER TABLE "InstrumentInGroup" DROP CONSTRAINT "InstrumentInGroup_instrumentGroupId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_ensembleId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_userId_fkey";

-- DropForeignKey
ALTER TABLE "Part" DROP CONSTRAINT "Part_songId_fkey";

-- DropForeignKey
ALTER TABLE "Song" DROP CONSTRAINT "Song_ensembleId_fkey";

-- AlterTable
ALTER TABLE "Song" ALTER COLUMN "ensembleId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "Ensemble"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "Ensemble"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "Ensemble"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAssignedUser" ADD CONSTRAINT "EventAssignedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAssignedUser" ADD CONSTRAINT "EventAssignedUser_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentGroup" ADD CONSTRAINT "InstrumentGroup_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "Ensemble"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentInGroup" ADD CONSTRAINT "InstrumentInGroup_instrumentGroupId_fkey" FOREIGN KEY ("instrumentGroupId") REFERENCES "InstrumentGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
