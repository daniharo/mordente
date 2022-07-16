import { Prisma, User } from "@prisma/client";
import prisma from "../../prisma/PrismaClient";

export const createUser = (user: Prisma.UserCreateInput) => {
  return prisma.user.create({
    data: user,
  });
};

export const getUser = ({ userUid }: { userUid: User["uid"] }) => {
  return prisma.user.findUnique({ where: { uid: userUid } });
};

export const updateUser = ({
  uid,
  ...data
}: {
  uid: User["uid"];
  data: Prisma.UserUpdateInput;
}) => {
  return prisma.user.update({
    where: { uid },
    data,
  });
};

export const deleteUser = ({ userUid }: { userUid: User["uid"] }) => {
  return prisma.user.delete({ where: { uid: userUid } });
};

export const getUserIdFromUID = async ({
  userUid,
}: {
  userUid: User["uid"];
}) => {
  const user = await prisma.user.findUnique({
    where: { uid: userUid },
    select: { id: true },
  });
  return user?.id;
};
