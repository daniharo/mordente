import { MiddlewareFn } from "grammy";
import { MyContext } from "../context";
import { Sentry } from "../Sentry";

export const useSentry: MiddlewareFn<MyContext> = (ctx, next) => {
  Sentry.setUser({
    id: ctx.from?.id?.toString(),
    username: ctx.from?.username,
  });
  Sentry.setContext("update", {
    callback_query: ctx.update.callback_query,
    inline_query: ctx.update.inline_query,
    text: ctx.update.message?.text,
    message_id: ctx.update.message?.message_id,
  });
  return next();
};
