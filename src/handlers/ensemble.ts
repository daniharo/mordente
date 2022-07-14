import { MiddlewareFn } from "grammy";
import { MyContext } from "../context";
import { Ensemble } from "@prisma/client";

export const createEnsembleHandler: MiddlewareFn<MyContext> = async (ctx) => {
  await ctx.reply(ctx.t("create_command_answer"), {
    reply_markup: { force_reply: true },
  });
  ctx.session.step = "create_ensemble_name";
};

export const printEnsembleHandler: (
  ensemble: Ensemble
) => MiddlewareFn<MyContext> = (ensemble) => async (ctx) => {
  await ctx.reply(ctx.templates.ensembleDetailTemplate({ ensemble }), {
    parse_mode: "HTML",
  });
};
