import { Menu } from "@grammyjs/menu";
import {
  disableJoinCode,
  enableAndGetJoinCode,
  getEnsemble,
  getEnsembleJoinCode,
  getEnsembleName,
} from "../utils/models/ensemble";
import { MyContext } from "../context";
import { deleteEnsembleHandler } from "../handlers/ensemble";
import { isAdmin } from "../utils/models/admin";
import { getMembers } from "../utils/models/membership";

const getButtonPayload = (ctx: MyContext) =>
  ctx.session.ensembleId?.toString() ?? "";

export const ensembleMenu = new Menu<MyContext>("ensemble")
  .dynamic(async (ctx, range) => {
    if (!ctx.session.ensembleId) {
      return;
    }
    const admin = await isAdmin({
      userId: ctx.userId,
      ensembleId: ctx.session.ensembleId,
    });
    if (admin) {
      const ensemble = await getEnsemble({
        ensembleId: ctx.session.ensembleId,
      });
      if (!ensemble) return;
      if (ensemble.joinCodeEnabled) {
        range
          .text(
            {
              text: "Obtener enlace de invitación",
              payload: (ctx) => ctx.session.ensembleId?.toString() ?? "",
            },
            async (ctx) => {
              if (!ctx.match) return;
              const joinCode = await getEnsembleJoinCode(+ctx.match);
              if (!joinCode) return;
              await ctx.reply(getInvitationLink(ctx.me.username, joinCode));
            }
          )
          .text(
            {
              text: "Deshabilitar enlace",
              payload: getButtonPayload,
            },
            async (ctx) => {
              if (!ctx.match) return;
              await disableJoinCode(+ctx.match);
              await ctx.reply(
                "El código de invitación se ha deshabilitado con éxito"
              );
            }
          );
      } else {
        range.text(
          {
            text: "Habilitar y obtener enlace de invitación",
            payload: getButtonPayload,
          },
          async (ctx) => {
            if (!ctx.match) return;
            const ensemble = await enableAndGetJoinCode(+ctx.match);
            await ctx.reply("Código de invitación habilitado.");
            await ctx.reply(
              getInvitationLink(ctx.me.username, ensemble.joinCode)
            );
          }
        );
      }
      range
        .row()
        .text(
          {
            text: "Eliminar",
            payload: getButtonPayload,
          },
          async (ctx) => {
            if (ctx.match) {
              const ensemble = await getEnsemble({ ensembleId: +ctx.match });
              if (ensemble) {
                await deleteEnsembleHandler(ensemble)(ctx);
              }
            }
          }
        )
        .row();
    }
  })
  .text(
    {
      text: "Miembros",
      payload: getButtonPayload,
    },
    async (ctx) => {
      const ensembleId = +ctx.match;
      if (!ensembleId) {
        return;
      }
      const ensembleName = await getEnsembleName({ ensembleId });
      if (!ensembleName) return;
      const members = await getMembers(ensembleId);
      await ctx.reply(
        ctx.templates.ensembleMembersTemplate({ members, ensembleName }),
        { parse_mode: "HTML" }
      );
    }
  );

const getInvitationLink = (botUserName: string, joinCode: string) =>
  `https://telegram.me/${botUserName}?start=${joinCode}`;
