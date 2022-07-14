import { MiddlewareFn } from "grammy";
import { MyContext } from "../context";
import { Ensemble } from "@prisma/client";
import { ensembleMenu } from "../menus/ensembleMenu";
import { deleteEnsemble } from "../utils/models/ensemble";

export const createEnsembleHandler: MiddlewareFn<MyContext> = async (ctx) => {
  await ctx.reply(ctx.t("create_command_answer"), {
    reply_markup: { force_reply: true },
  });
  ctx.session.step = "create_ensemble_name";
};

export const printEnsembleHandler: (
  ensemble: Ensemble
) => MiddlewareFn<MyContext> = (ensemble) => async (ctx) => {
  ctx.session.ensembleId = ensemble.id;
  await ctx.reply(ctx.templates.ensembleDetailTemplate({ ensemble }), {
    parse_mode: "HTML",
    reply_markup: ensembleMenu,
  });
};

export const deleteEnsembleHandler: (
  ensemble: Ensemble
) => MiddlewareFn<MyContext> = (ensemble) => async (ctx) => {
  await deleteEnsemble({ ensembleId: ensemble.id });
  await ctx.reply(`La agrupación "${ensemble.name}" ha sido eliminada.`);
};
