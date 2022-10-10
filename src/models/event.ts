import { Ensemble, Event, Prisma, EventStatus } from "@prisma/client";
import prisma from "../prisma/PrismaClient";

export const getAllEventsForEnsemble = (ensembleId: Ensemble["id"]) =>
  prisma.event.findMany({ where: { ensembleId } });

export const getFutureEventsForEnsemble = (ensembleId: Ensemble["id"]) =>
  prisma.event.findMany({
    where: {
      ensembleId,
      startDate: { gt: new Date() },
    },
  });

export const getCurrentEventsForEnsemble = (ensembleId: Ensemble["id"]) => {
  const now = new Date();
  return prisma.event.findMany({
    where: {
      ensembleId,
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });
};

export const getPastEventsForEnsemble = (ensembleId: Ensemble["id"]) =>
  prisma.event.findMany({
    where: {
      ensembleId,
      endDate: { lt: new Date() },
    },
  });

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
