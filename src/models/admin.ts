import { Admin, Ensemble, Membership } from "@prisma/client";
import prisma from "../prisma/PrismaClient";

export const isAdmin = async ({
  userId,
  ensembleId,
}: {
  userId: Membership["userId"];
  ensembleId: Membership["ensembleId"];
}) => {
  const membership = await prisma.membership.findUnique({
    where: { userId_ensembleId: { userId, ensembleId } },
    select: { admin: true },
  });
  return !!membership?.admin;
};

export const makeAdmin = async (
  userId: Membership["userId"],
  ensembleId: Membership["ensembleId"],
  adminType?: Admin["adminType"]
) =>
  prisma.admin.create({
    data: {
      adminType,
      membership: {
        connect: {
          userId_ensembleId: { userId, ensembleId },
        },
      },
    },
  });

export const deleteAdmin = async (
  userId: Membership["userId"],
  ensembleId: Membership["ensembleId"]
) => {
  const membership = await prisma.membership.findUnique({
    where: { userId_ensembleId: { userId, ensembleId } },
  });
  if (membership) {
    return prisma.admin.delete({ where: { membershipId: membership.id } });
  }
  return null;
};

export const updateAdmin = async ({
  userId,
  ensembleId,
  adminType,
}: {
  userId: Membership["userId"];
  ensembleId: Membership["ensembleId"];
  adminType?: Admin["adminType"];
}) => {
  return prisma.membership
    .update({
      where: { userId_ensembleId: { userId, ensembleId } },
      data: {
        admin: {
          update: {
            adminType,
          },
        },
      },
    })
    .admin();
};

export const getAdmins = async (ensembleId: Ensemble["id"]) => {
  return prisma.membership.findMany({
    where: { ensembleId, admin: { isNot: null } },
  });
};

export const getAdminsCount = async (ensembleId: Ensemble["id"]) => {
  return prisma.membership.count({
    where: { ensembleId, admin: { isNot: null } },
  });
};
