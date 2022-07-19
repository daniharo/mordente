import { MyContext } from "../context";
import { Ensemble } from "@prisma/client";
import { ensembleMenu } from "../menus/ensembleMenu";
import { deleteEnsemble } from "../utils/models/ensemble";
import { userIsMember } from "../utils/models/membership";
import { isAdmin } from "../utils/models/admin";

export const createEnsembleHandler = async (ctx: MyContext) => {
  await ctx.reply(ctx.t("create_command_answer"));
  ctx.session.step = "create_ensemble_name";
};

export const printEnsembleHandler =
  (ensemble: Ensemble) => async (ctx: MyContext) => {
    if (
      !(await userIsMember({
        userId: ctx.userId,
        ensembleId: ensemble.id,
      }))
    ) {
      await ctx.reply("No eres miembro de esta agrupación.");
      return;
    }
    ctx.session.ensembleId = ensemble.id;
    await ctx.reply(ctx.templates.ensembleDetailTemplate({ ensemble }), {
      parse_mode: "HTML",
      reply_markup: ensembleMenu,
    });
  };

export const deleteEnsembleHandler =
  (ensemble: Ensemble) => async (ctx: MyContext) => {
    if (
      !(await isAdmin({
        userId: ctx.userId,
        ensembleId: ensemble.id,
      }))
    ) {
      await ctx.reply("No eres administrador de esta agrupación.");
      return;
    }
    await deleteEnsemble({ ensembleId: ensemble.id });
    await ctx.reply(`La agrupación "${ensemble.name}" ha sido eliminada.`);
  };

export const printJoinCodeHandler =
  (joinCode: string) => async (ctx: MyContext) => {
    await ctx.reply(getInvitationLink(ctx.me.username, joinCode));
  };

const getInvitationLink = (botUserName: string, joinCode: string) =>
  `https://telegram.me/${botUserName}?start=${joinCode}`;
