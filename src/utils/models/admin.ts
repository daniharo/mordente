import { Admin, Membership } from "@prisma/client";
import prisma from "../../prisma/PrismaClient.js";

export const isAdmin = ({
  userUid,
  agrupationId,
}: {
  userUid: Membership["userUid"];
  agrupationId: Membership["agrupationId"];
}) =>
  prisma.membership
    .findUnique({
      where: { userUid_agrupationId: { userUid, agrupationId } },
    })
    .admin() !== null;

export const makeAdmin = async ({
  userUid,
  agrupationId,
  adminType,
}: {
  userUid: Membership["userUid"];
  agrupationId: Membership["agrupationId"];
  adminType?: Admin["adminType"];
}) =>
  prisma.admin.create({
    data: {
      adminType,
      membership: {
        connect: {
          userUid_agrupationId: { userUid, agrupationId },
        },
      },
    },
  });

export const removeAdmin = async ({
  userUid,
  agrupationId,
}: {
  userUid: Membership["userUid"];
  agrupationId: Membership["agrupationId"];
}) => {
  const membership = await prisma.membership.findUnique({
    where: { userUid_agrupationId: { userUid, agrupationId } },
  });
  if (membership) {
    return prisma.admin.delete({ where: { membershipId: membership.id } });
  }
  return null;
};

export const updateAdmin = async ({
  userUid,
  agrupationId,
  adminType,
}: {
  userUid: Membership["userUid"];
  agrupationId: Membership["agrupationId"];
  adminType?: Admin["adminType"];
}) => {
  return prisma.membership
    .update({
      where: { userUid_agrupationId: { userUid, agrupationId } },
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
