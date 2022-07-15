import { MiddlewareFn } from "grammy";
import { MyContext } from "../context";
import { Ensemble } from "@prisma/client";
import { ensembleMenu } from "../menus/ensembleMenu";
import { deleteEnsemble } from "../utils/models/ensemble";
import { telegramUserIsMember } from "../utils/models/membership";
import { telegramUserIsAdmin } from "../utils/models/admin";

export const createEnsembleHandler: MiddlewareFn<MyContext> = async (ctx) => {
  await ctx.reply(ctx.t("create_command_answer"), {
    reply_markup: { force_reply: true },
  });
  ctx.session.step = "create_ensemble_name";
};

export const printEnsembleHandler: (
  ensemble: Ensemble
) => MiddlewareFn<MyContext> = (ensemble) => async (ctx) => {
  if (
    !(await telegramUserIsMember({
      telegramUserId: ctx.from?.id,
      ensembleId: ensemble.id,
    }))
  ) {
    ctx.reply("No eres miembro de esta agrupación.");
    return;
  }
  ctx.session.ensembleId = ensemble.id;
  await ctx.reply(ctx.templates.ensembleDetailTemplate({ ensemble }), {
    parse_mode: "HTML",
    reply_markup: ensembleMenu,
  });
};

export const deleteEnsembleHandler: (
  ensemble: Ensemble
) => MiddlewareFn<MyContext> = (ensemble) => async (ctx) => {
  if (
    !(await telegramUserIsAdmin({
      telegramUserId: ctx.from?.id,
      ensembleId: ensemble.id,
    }))
  ) {
    ctx.reply("No eres administrador de esta agrupación.");
    return;
  }
  await deleteEnsemble({ ensembleId: ensemble.id });
  await ctx.reply(`La agrupación "${ensemble.name}" ha sido eliminada.`);
};
