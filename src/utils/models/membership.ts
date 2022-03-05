import { Ensemble, User } from "@prisma/client";
import prisma from "../../prisma/PrismaClient";

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
