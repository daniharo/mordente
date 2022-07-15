import { Ensemble, User } from "@prisma/client";
import prisma from "../../prisma/PrismaClient";
import { getUserIdFromUID } from "./user";

export const joinEnsemble = ({
  userId,
  ensembleId,
}: {
  userId: User["id"];
  ensembleId: Ensemble["id"];
}) => {
  return prisma.membership.create({
    data: {
      userId,
      ensembleId,
    },
  });
};

export const telegramUserIsMember = async ({
  telegramUserId,
  ensembleId,
}: {
  telegramUserId?: User["uid"];
  ensembleId: Ensemble["id"];
}) => {
  if (!telegramUserId) return false;
  const userId = await getUserIdFromUID({ userUid: telegramUserId });
  return userId ? userIsMember({ userId, ensembleId }) : false;
};

export const userIsMember = async ({
  userId,
  ensembleId,
}: {
  userId: User["id"];
  ensembleId: Ensemble["id"];
}) => {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_ensembleId: {
        userId,
        ensembleId,
      },
    },
  });
  return !!membership;
};
