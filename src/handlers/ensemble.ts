import { MiddlewareFn } from "grammy";
import { MyContext } from "../context";

export const createEnsembleHandler: MiddlewareFn<MyContext> = async (ctx) => {
  await ctx.reply(ctx.t("create_command_answer"), {
    reply_markup: { force_reply: true },
  });
  ctx.session.step = "create_ensemble_name";
};
