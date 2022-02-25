import { User, Ensemble } from "@prisma/client";
import prisma from "../../prisma/PrismaClient.js";

export const createEnsemble = async ({
  userUid,
  ...rest
}: Ensemble & { userUid: User["uid"] }) => {
  return await prisma.ensemble.create({
    data: {
      ...rest,
      memberships: {
        create: {
          admin: {
            create: {},
          },
          userUid,
        },
      },
    },
  });
};

export const getEnsemblesForUser = async ({
  userUid,
}: {
  userUid: User["uid"];
}) => {
  const memberships = await prisma.membership.findMany({
    where: { userUid },
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
