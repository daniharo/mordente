-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'CANCELED', 'POSTPONED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "Instrument" AS ENUM ('FLUTE', 'CLARINET', 'SAX', 'HORN', 'BASS', 'PERCUSSION', 'TRUMPET', 'TROMBONE', 'BASSOON', 'OBOE', 'VIOLIN', 'VIOLA', 'CELLO', 'GUITAR', 'PIANO');

-- CreateEnum
CREATE TYPE "AttendanceAnswer" AS ENUM ('YES', 'NO', 'UNKNOWN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "uid" INTEGER NOT NULL,
    "username" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ensemble" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "joinCode" TEXT NOT NULL,
    "joinCodeEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Ensemble_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" SERIAL NOT NULL,
    "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ensembleId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "instrument" "Instrument",

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Song" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT,
    "type" TEXT,
    "ensembleId" INTEGER,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Part" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "instrument" "Instrument" NOT NULL,
    "songId" INTEGER NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "eventType" TEXT,
    "ensembleId" INTEGER NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT E'DRAFT',

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAssignedUser" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "attendance" "AttendanceAnswer",
    "attendanceJustification" TEXT,

    CONSTRAINT "EventAssignedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "adminType" TEXT,
    "membershipId" INTEGER NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ensembleId" INTEGER NOT NULL,

    CONSTRAINT "InstrumentGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentInGroup" (
    "id" SERIAL NOT NULL,
    "instrumentGroupId" INTEGER NOT NULL,
    "instrument" "Instrument" NOT NULL,

    CONSTRAINT "InstrumentInGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "User"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Ensemble_joinCode_key" ON "Ensemble"("joinCode");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_ensembleId_key" ON "Membership"("userId", "ensembleId");

-- CreateIndex
CREATE UNIQUE INDEX "EventAssignedUser_eventId_userId_key" ON "EventAssignedUser"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_membershipId_key" ON "Admin"("membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "InstrumentInGroup_instrument_instrumentGroupId_key" ON "InstrumentInGroup"("instrument", "instrumentGroupId");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "Ensemble"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "Ensemble"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "Ensemble"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAssignedUser" ADD CONSTRAINT "EventAssignedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAssignedUser" ADD CONSTRAINT "EventAssignedUser_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentGroup" ADD CONSTRAINT "InstrumentGroup_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "Ensemble"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentInGroup" ADD CONSTRAINT "InstrumentInGroup_instrumentGroupId_fkey" FOREIGN KEY ("instrumentGroupId") REFERENCES "InstrumentGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
