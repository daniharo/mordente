import { User, Ensemble, Prisma } from "@prisma/client";
import prisma from "../../prisma/PrismaClient";

export const createEnsemble = async ({
  userId,
  ...rest
}: Prisma.EnsembleCreateInput & { userId: User["id"] }) => {
  return prisma.ensemble.create({
    data: {
      ...rest,
      memberships: {
        create: {
          admin: {
            create: {},
          },
          userId,
        },
      },
    },
  });
};

export const getEnsemblesForUser = async ({
  userId,
}: {
  userId: User["id"];
}) => {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    select: { ensemble: true },
  });
  return memberships.map((membership) => membership.ensemble);
};

export const updateEnsemble = async ({
  id,
  ...data
}: { id: Ensemble["id"] } & Prisma.EnsembleUpdateInput) => {
  return prisma.ensemble.update({
    where: { id },
    data,
  });
};

export const deleteEnsemble = async ({
  ensembleId,
}: {
  ensembleId: Ensemble["id"];
}) => {
  return prisma.ensemble.delete({ where: { id: ensembleId } });
};

export const getEnsembleName = async ({
  ensembleId,
}: {
  ensembleId: Ensemble["id"];
}) => {
  const ensemble = await prisma.ensemble.findUnique({
    where: { id: ensembleId },
    select: { name: true },
  });
  return ensemble?.name;
};

export const getEnsemble = async ({
  ensembleId,
}: {
  ensembleId: Ensemble["id"];
}) => {
  return prisma.ensemble.findUnique({
    where: { id: ensembleId },
  });
};

export const userHasAccessToEnsemble = async ({
  userId,
  ensembleId,
}: {
  userId: User["id"];
  ensembleId: Ensemble["id"];
}) => {
  const membership = await prisma.membership.findUnique({
    where: { userId_ensembleId: { userId, ensembleId } },
    select: { id: true },
  });
  return membership !== null;
};
