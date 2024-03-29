import {
  disableJoinCode,
  enableAndGetJoinCode,
  getEnsemble,
  getEnsembleJoinCode,
  getEnsembleName,
} from "../models/ensemble";
import { MyContext } from "../context";
import {
  deleteEnsembleHandler,
  printJoinCodeHandler,
} from "../handlers/ensemble";
import { isAdmin } from "../models/admin";
import { getMembers, getMyMembershipId } from "../models/membership";
import { printMembershipHandler } from "../handlers/membership";
import { listEventsHandler } from "../handlers/event";
import { Ensemble } from "@prisma/client";
import { Composer, InlineKeyboard } from "grammy";
import { getSongs } from "../models/song";
import { songListMenu } from "./songListMenu";
import { editEnsembleMenu } from "../composers/useEditEnsemble";

export const ensembleMenu =
  (ctx: MyContext) => async (ensembleId: Ensemble["id"]) => {
    const menu = new InlineKeyboard();
    const admin = await isAdmin({
      userId: ctx.userId,
      ensembleId,
    });
    if (admin) {
      const ensemble = await getEnsemble({ ensembleId });
      if (!ensemble) return undefined;
      menu.text("Invitar", `ensemble_invite_${ensembleId}`);
      if (ensemble.joinCodeEnabled) {
        menu.text("Deshabilitar invitación", `ensemble_uninvite_${ensembleId}`);
      }
      menu
        .row()
        .text("Editar", `ensemble_edit_${ensembleId}`)
        .row()
        .text("Eliminar", `ensemble_delete_unconfirmed_${ensembleId}`)
        .row();
    }
    menu
      .text("Ver obras", `ensemble_songs_${ensembleId}`)
      .row()
      .text("Miembros", `ensemble_members_${ensembleId}`)
      .row()
      .text("Mi inscripción", `ensemble_my_membership_${ensembleId}`);
    menu.text("Eventos", `ensemble_events_${ensembleId}`);
    return menu;
  };

export const useEnsembleMenu = new Composer<MyContext>();

useEnsembleMenu.callbackQuery(/ensemble_invite_(\w+)/, async (ctx) => {
  if (!ctx.match) return;
  const ensembleId = +ctx.match[1];
  const ensemble = await getEnsemble({ ensembleId });
  if (!ensemble) return;
  const obtainCode = ensemble.joinCodeEnabled
    ? getEnsembleJoinCode
    : enableAndGetJoinCode;
  const joinCode = await obtainCode(ensembleId);
  if (!joinCode) return;
  if (!ensemble.joinCodeEnabled) {
    await ctx.reply("Código de invitación habilitado.");
  }
  await ctx.answerCallbackQuery();
  await printJoinCodeHandler(joinCode)(ctx);
});

useEnsembleMenu.callbackQuery(/ensemble_uninvite_(\w+)/, async (ctx) => {
  if (!ctx.match) return;
  const ensembleId = +ctx.match[1];
  await disableJoinCode(ensembleId);
  await ctx.answerCallbackQuery();
  await ctx.reply("El código de invitación se ha deshabilitado con éxito.");
});

useEnsembleMenu.callbackQuery(/ensemble_members_(\w+)/, async (ctx) => {
  if (!ctx.match) return;
  const ensembleId = +ctx.match[1];
  const ensembleName = await getEnsembleName({ ensembleId });
  if (!ensembleName) return;
  const members = await getMembers(ensembleId);
  await ctx.answerCallbackQuery();
  await ctx.reply(
    ctx.templates.ensembleMembersTemplate({ members, ensembleName }),
    { parse_mode: "HTML", disable_web_page_preview: true }
  );
});

useEnsembleMenu.callbackQuery(/ensemble_my_membership_(\w+)/, async (ctx) => {
  if (!ctx.match) return;
  const ensembleId = +ctx.match[1];
  const myMembershipId = await getMyMembershipId(ctx.userId, ensembleId);
  if (!myMembershipId) return;
  await ctx.answerCallbackQuery();
  await printMembershipHandler(myMembershipId)(ctx);
});

useEnsembleMenu.callbackQuery(/ensemble_events_(\w+)/, async (ctx) => {
  if (!ctx.match) return;
  const ensembleId = +ctx.match[1];
  await ctx.answerCallbackQuery();
  await listEventsHandler(ensembleId)(ctx);
});

useEnsembleMenu.callbackQuery(/ensemble_edit_(\w+)/, async (ctx) => {
  if (!ctx.match) return;
  const ensembleId = +ctx.match[1];
  ctx.session.ensembleId = ensembleId;
  await ctx.answerCallbackQuery();
  await ctx.editMessageReplyMarkup({ reply_markup: editEnsembleMenu });
});

useEnsembleMenu.callbackQuery(
  /ensemble_delete_unconfirmed_(\w+)/,
  async (ctx) => {
    if (!ctx.match) return;
    const ensembleId = +ctx.match[1];
    await ctx.answerCallbackQuery();
    return ctx.reply("¿Seguro que quieres eliminar la agrupación?", {
      reply_markup: deleteConfirmationMenu(ensembleId),
    });
  }
);

useEnsembleMenu.callbackQuery(/ensemble_songs_(\w+)/, async (ctx) => {
  if (!ctx.match) return;
  const ensembleId = +ctx.match[1];
  await ctx.answerCallbackQuery();
  ctx.session.ensembleId = ensembleId;
  const songs = await getSongs(ensembleId);
  await ctx.reply(ctx.templates.songListTemplate({ songs }), {
    parse_mode: "HTML",
    reply_markup: songListMenu,
  });
});

const deleteConfirmationMenu = (ensembleId: Ensemble["id"]) => {
  const menu = new InlineKeyboard();
  return menu
    .text("Sí", `ensemble_delete_confirmed_${ensembleId}`)
    .text("No", `ensemble_delete_canceled`);
};

const useDeleteConfirmationMenu = new Composer<MyContext>();
useDeleteConfirmationMenu.callbackQuery(
  /ensemble_delete_confirmed_(\w+)/,
  async (ctx) => {
    if (!ctx.match) return;
    const ensembleId = +ctx.match[1];
    await ctx.answerCallbackQuery();
    await deleteEnsembleHandler(ensembleId)(ctx);
  }
);

useEnsembleMenu.use(useDeleteConfirmationMenu);
