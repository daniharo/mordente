import {
  User,
  Event,
  AttendanceAnswer,
  EventAssignedUser,
} from "@prisma/client";
import prisma from "../prisma/PrismaClient";

export const getEventAssignation = (eventId: Event["id"], userId: User["id"]) =>
  prisma.eventAssignedUser.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });

export const upsertEventAssignationAnswer = (
  eventId: Event["id"],
  userId: User["id"],
  attendance: AttendanceAnswer,
  attendanceJustification:
    | EventAssignedUser["attendanceJustification"]
    | undefined
) =>
  prisma.eventAssignedUser.upsert({
    where: { eventId_userId: { userId, eventId } },
    create: {
      eventId,
      userId,
      attendance,
      attendanceJustification,
    },
    update: {
      eventId,
      userId,
      attendance,
      attendanceJustification,
    },
    include: {
      user: true,
      event: true,
    },
  });

export const getAllAttendances = (eventId: Event["id"]) =>
  prisma.eventAssignedUser.findMany({
    where: { eventId },
    include: { user: true },
  });

export const assignAllMembers = async (eventId: Event["id"]) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      ensemble: {
        select: { memberships: { select: { user: { select: { id: true } } } } },
      },
    },
  });
  if (!event) return null;
  const userIds = event.ensemble.memberships.map(
    (membership) => membership.user.id
  );
  return prisma.eventAssignedUser.createMany({
    skipDuplicates: true,
    data: userIds.map((userId) => ({ userId, eventId })),
  });
};

export const getAllAssignationsForTime = async (
  startTime: Date,
  endTime: Date
) =>
  prisma.eventAssignedUser.findMany({
    where: {
      event: {
        startDate: {
          lt: endTime,
        },
        endDate: {
          gt: startTime,
        },
      },
      attendance: "YES",
    },
    include: { event: true, user: { select: { id: true, uid: true } } },
  });

export const assignMember = (eventId: Event["id"], userId: User["id"]) =>
  prisma.eventAssignedUser.create({ data: { userId, eventId } });

export const unassignMember = (eventId: Event["id"], userId: User["id"]) =>
  prisma.eventAssignedUser.delete({
    where: { eventId_userId: { eventId, userId } },
  });
