import { Admin, Membership } from "@prisma/client";
import prisma from "../../prisma/PrismaClient.js";

export const isAdmin = ({
  userId,
  ensembleId,
}: {
  userId: Membership["userId"];
  ensembleId: Membership["ensembleId"];
}) =>
  prisma.membership
    .findUnique({
      where: { userId_ensembleId: { userId, ensembleId } },
    })
    .admin() !== null;

export const makeAdmin = async ({
  userId,
  ensembleId,
  adminType,
}: {
  userId: Membership["userId"];
  ensembleId: Membership["ensembleId"];
  adminType?: Admin["adminType"];
}) =>
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

export const deleteAdmin = async ({
  userId,
  ensembleId,
}: {
  userId: Membership["userId"];
  ensembleId: Membership["ensembleId"];
}) => {
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
