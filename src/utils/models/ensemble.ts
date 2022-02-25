import { User, Ensemble } from "@prisma/client";
import prisma from "../../prisma/PrismaClient.js";

export const createEnsemble = async ({
  userId,
  ...rest
}: Ensemble & { userId: User["id"] }) => {
  return await prisma.ensemble.create({
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

export const updateEnsemble = async ({ id, ...data }: Ensemble) => {
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
