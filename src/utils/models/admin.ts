import { Admin, Membership } from "@prisma/client";
import prisma from "../../prisma/PrismaClient.js";

export const isAdmin = ({
  userUid,
  ensembleId,
}: {
  userUid: Membership["userUid"];
  ensembleId: Membership["ensembleId"];
}) =>
  prisma.membership
    .findUnique({
      where: { userUid_ensembleId: { userUid, ensembleId } },
    })
    .admin() !== null;

export const makeAdmin = async ({
  userUid,
  ensembleId,
  adminType,
}: {
  userUid: Membership["userUid"];
  ensembleId: Membership["ensembleId"];
  adminType?: Admin["adminType"];
}) =>
  prisma.admin.create({
    data: {
      adminType,
      membership: {
        connect: {
          userUid_ensembleId: { userUid, ensembleId },
        },
      },
    },
  });

export const removeAdmin = async ({
  userUid,
  ensembleId,
}: {
  userUid: Membership["userUid"];
  ensembleId: Membership["ensembleId"];
}) => {
  const membership = await prisma.membership.findUnique({
    where: { userUid_ensembleId: { userUid, ensembleId } },
  });
  if (membership) {
    return prisma.admin.delete({ where: { membershipId: membership.id } });
  }
  return null;
};

export const updateAdmin = async ({
  userUid,
  ensembleId,
  adminType,
}: {
  userUid: Membership["userUid"];
  ensembleId: Membership["ensembleId"];
  adminType?: Admin["adminType"];
}) => {
  return prisma.membership
    .update({
      where: { userUid_ensembleId: { userUid, ensembleId } },
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
