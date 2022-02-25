import { User } from "@prisma/client";
import prisma from "../../prisma/PrismaClient.js";

export const createUser = (user: User) => {
  return prisma.user.create({
    data: user,
  });
};

export const getUser = ({ userUid }: { userUid: User["uid"] }) => {
  return prisma.user.findUnique({ where: { uid: userUid } });
};

export const updateUser = ({ uid, ...data }: User) => {
  return prisma.user.update({
    where: { uid },
    data,
  });
};

export const deleteUser = ({ userUid }: { userUid: User["uid"] }) => {
  return prisma.user.delete({ where: { uid: userUid } });
};