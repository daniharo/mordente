import { Ensemble, Membership, Prisma, User } from "@prisma/client";
import prisma from "../prisma/PrismaClient";

export const joinEnsemble = async ({
  userId,
  joinCode,
}: {
  userId: User["id"];
  joinCode: Ensemble["joinCode"];
}) => {
  const ensemble = await prisma.ensemble.findUnique({ where: { joinCode } });
  if (!ensemble || !ensemble.joinCodeEnabled) {
    return null;
  }
  try {
    return prisma.membership.create({
      data: { ensembleId: ensemble.id, userId },
      include: { ensemble: true, user: true },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002" // Unique constraint error
    ) {
      return null;
    }
    throw e;
  }
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

export const getMembers = async (ensembleId: Ensemble["id"]) => {
  return prisma.membership.findMany({
    where: { ensembleId },
    include: {
      user: true,
    },
  });
};

export const getMembership = async (membershipId: Membership["id"]) => {
  return prisma.membership.findUnique({
    where: { id: membershipId },
    include: { user: true, ensemble: true },
  });
};

export const deleteMembership = async (membershipId: Membership["id"]) => {
  return prisma.membership.delete({ where: { id: membershipId } });
};

export const getMembershipsForUser = (userId: User["id"]) =>
  prisma.membership.findMany({
    where: { userId },
    include: { ensemble: true, admin: true },
  });

export const getMyMembershipId = async (
  userId: User["id"],
  ensembleId: Ensemble["id"]
) => {
  const membership = await prisma.membership.findUnique({
    where: { userId_ensembleId: { userId, ensembleId } },
    select: { id: true },
  });
  return membership?.id;
};

export const getMembershipCount = (ensembleId: Ensemble["id"]) =>
  prisma.membership.count({ where: { ensembleId } });
