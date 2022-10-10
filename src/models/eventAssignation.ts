import { User, Event, AttendanceAnswer } from "@prisma/client";
import prisma from "../prisma/PrismaClient";

export const getEventAssignation = (eventId: Event["id"], userId: User["id"]) =>
  prisma.eventAssignedUser.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });

export const upsertEventAssignationAnswer = (
  eventId: Event["id"],
  userId: User["id"],
  attendance: AttendanceAnswer
) =>
  prisma.eventAssignedUser.upsert({
    where: { eventId_userId: { userId, eventId } },
    create: {
      eventId,
      userId,
      attendance,
    },
    update: {
      eventId,
      userId,
      attendance,
    },
  });
