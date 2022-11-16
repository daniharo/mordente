import { MyContext } from "../context";
import { Ensemble } from "@prisma/client";
import { ensembleMenu } from "../menus/ensembleMenu";
import { deleteEnsemble } from "../models/ensemble";
import { userIsMember } from "../models/membership";
import { isAdmin } from "../models/admin";
import { createEnsembleConversation } from "../conversations/createEnsemble";
import { ensembleDetailTemplate } from "../utils/templates";

export const createEnsembleHandler = async (ctx: MyContext) => {
  await ctx.conversation.enter(createEnsembleConversation.name);
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
    await ctx.reply(ensembleDetailTemplate({ ensemble, t: ctx.t }), {
      parse_mode: "HTML",
      reply_markup: await ensembleMenu(ctx)(ensemble.id),
    });
  };

export const deleteEnsembleHandler =
  (ensembleId: Ensemble["id"]) => async (ctx: MyContext) => {
    if (
      !(await isAdmin({
        userId: ctx.userId,
        ensembleId: ensembleId,
      }))
    ) {
      await ctx.reply("No eres administrador de esta agrupación.");
      return;
    }
    const ensemble = await deleteEnsemble(ensembleId);
    await ctx.reply(`La agrupación "${ensemble.name}" ha sido eliminada.`);
  };

export const printJoinCodeHandler =
  (joinCode: string) => async (ctx: MyContext) => {
    await ctx.reply(
      "Aquí tienes el enlace de invitación. " +
        "Envíaselo a tus compañeros para que se unan a la agrupación 😀"
    );
    await ctx.reply(getInvitationLink(ctx.me.username, joinCode));
  };

const getInvitationLink = (botUserName: string, joinCode: string) =>
  `https://telegram.me/${botUserName}?start=${joinCode}`;
