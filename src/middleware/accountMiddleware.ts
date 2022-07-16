import { Context, MiddlewareFn, SessionFlavor } from "grammy";
import { createUser, getUser } from "../utils/models/user";
import { User } from "@prisma/client";

export const useAccount: MiddlewareFn<AccountContextFlavor> = async (
  ctx,
  next
) => {
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
