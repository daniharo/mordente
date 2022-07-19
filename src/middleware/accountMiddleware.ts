import { Context, MiddlewareFn, SessionFlavor } from "grammy";
import { createUser, getUser, updateUser } from "../models/user";
import { User } from "@prisma/client";

export const useAccount: MiddlewareFn<AccountContextFlavor> = async (
  ctx,
  next
) => {
  if (ctx.from?.id === undefined) {
    await next();
    return;
  }
  if (!ctx.session.userId) {
    let user = await getUser({ userUid: ctx.from!.id });
    if (!user) {
      user = await createUser({
        uid: ctx.from!.id,
        username: ctx.from?.username,
        firstName: ctx.from!.first_name,
        lastName: ctx.from?.last_name,
      });
    }
    if (
      (ctx.from.username && user.username !== ctx.from.username) ||
      (ctx.from.first_name && user.firstName !== ctx.from.first_name) ||
      (ctx.from.last_name && user.lastName !== ctx.from.last_name)
    ) {
      user = await updateUser({
        uid: user.uid,
        data: {
          username: ctx.from.username,
          firstName: ctx.from.first_name,
          lastName: ctx.from.last_name,
        },
      });
    }
    ctx.session.userId = user.id;
  }
  ctx.userId = ctx.session.userId;
  await next();
};

export type AccountContextFlavor = Context &
  SessionFlavor<AccountSessionData> & {
    userId: User["id"];
  };

export type AccountSessionData = {
  userId?: User["id"];
};
