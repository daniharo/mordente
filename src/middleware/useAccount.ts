import { Context, MiddlewareFn, SessionFlavor } from "grammy";
import { createUser, getUser, updateUser } from "../models/user";
import { User } from "@prisma/client";

const REFRESH_DATA_DAYS = 1;

const daysBetweenDates = (date1: Date, date2: Date) => {
  const difference = date2.getTime() - date1.getTime();
  return difference / (1000 * 3600 * 24);
};

export const useAccount: MiddlewareFn<AccountContextFlavor> = async (
  ctx,
  next
) => {
  if (ctx.from === undefined || ctx.from.is_bot) {
    await next();
    return;
  }
  const now = new Date();
  const lastUpdate = ctx.session.lastUpdate
    ? new Date(ctx.session.lastUpdate)
    : undefined;
  if (
    !ctx.session.userId ||
    !lastUpdate ||
    daysBetweenDates(lastUpdate, now) > REFRESH_DATA_DAYS
  ) {
    let user = await getUser({ userUid: ctx.from.id });
    if (!user) {
      user = await createUser({
        uid: ctx.from.id,
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
      });
    }
    if (
      user.username !== ctx.from.username ||
      user.firstName !== ctx.from.first_name ||
      user.lastName !== ctx.from.last_name
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
    ctx.session.lastUpdate = now.toISOString();
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
  lastUpdate?: string;
};
