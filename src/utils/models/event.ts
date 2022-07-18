import { Ensemble, Prisma } from "@prisma/client";
import prisma from "../../prisma/PrismaClient";

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
