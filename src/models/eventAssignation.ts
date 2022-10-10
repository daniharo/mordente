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
  });
