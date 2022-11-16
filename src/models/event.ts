import { Ensemble, Event, Prisma, EventStatus, User } from "@prisma/client";
import prisma from "../prisma/PrismaClient";

export const getAllEventsForEnsemble = (ensembleId: Ensemble["id"]) =>
  prisma.event.findMany({ where: { ensembleId } });

async function getEvents(
  ensembleId: Ensemble["id"],
  userId: User["id"] | undefined,
  where: Prisma.EventWhereInput
): Promise<Event[]> {
  if (userId === undefined) {
    return prisma.event.findMany({ where });
  }
  const assignations = await prisma.eventAssignedUser.findMany({
    where: { userId, event: where },
    select: { event: true },
  });
  return assignations.map((assignation) => assignation.event);
}

export function getFutureEvents(
  ensembleId: Ensemble["id"],
  userId?: User["id"]
): Promise<Event[]> {
  const now = new Date();
  const eventWhereArgs: Prisma.EventWhereInput = {
    ensembleId,
    startDate: { gt: now },
  };
  return getEvents(ensembleId, userId, eventWhereArgs);
}

export function getCurrentEvents(
  ensembleId: Ensemble["id"],
  userId?: User["id"]
): Promise<Event[]> {
  const now = new Date();
  const eventWhereArgs: Prisma.EventWhereInput = {
    ensembleId,
    startDate: { lte: now },
    endDate: { gte: now },
  };
  return getEvents(ensembleId, userId, eventWhereArgs);
}

export function getPastEvents(
  ensembleId: Ensemble["id"],
  userId?: User["id"]
): Promise<Event[]> {
  const now = new Date();
  const eventWhereArgs: Prisma.EventWhereInput = {
    ensembleId,
    endDate: { lt: now },
  };
  return getEvents(ensembleId, userId, eventWhereArgs);
}

export const createEvent = (eventData: Prisma.EventCreateInput) =>
  prisma.event.create({ data: eventData });

export const getEvent = (eventId: Event["id"]) =>
  prisma.event.findUnique({
    where: {
      id: eventId,
    },
  });

export const deleteEvent = (eventId: Event["id"]) =>
  prisma.event.delete({
    where: {
      id: eventId,
    },
  });

export const updateEventStatus = (eventId: Event["id"], status: EventStatus) =>
  prisma.event.update({
    where: {
      id: eventId,
    },
    data: {
      status: status,
    },
  });

export const updateEvent = (
  eventId: Event["id"],
  data: Prisma.EventUpdateInput
) =>
  prisma.event.update({
    where: { id: eventId },
    data,
  });

export const getEnsembleId = async (eventId: Event["id"]) =>
  (
    await prisma.event.findUnique({
      where: { id: eventId },
      select: { ensembleId: true },
    })
  )?.ensembleId;
