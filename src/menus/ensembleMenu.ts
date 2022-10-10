import { Menu } from "@grammyjs/menu";
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
import { membershipMenu } from "./membershipMenu";
import { listEventsHandler } from "../handlers/event";

export const ensembleMenu = new Menu<MyContext>("ensemble").dynamic(
  async (ctx, range) => {
    const { ensembleId } = ctx.session;
    if (!ensembleId) {
      return;
    }
    const admin = await isAdmin({
      userId: ctx.userId,
      ensembleId,
    });
    if (admin) {
      const ensemble = await getEnsemble({ ensembleId });
      if (!ensemble) return;
      range.text("Invitar", async (ctx) => {
        const obtainCode = ensemble.joinCodeEnabled
          ? getEnsembleJoinCode
          : enableAndGetJoinCode;
        const joinCode = await obtainCode(ensembleId);
        if (!joinCode) return;
        if (!ensemble.joinCodeEnabled) {
          ctx.menu.update();
          await ctx.reply("Código de invitación habilitado.");
        }
        await printJoinCodeHandler(joinCode)(ctx);
      });
      if (ensemble.joinCodeEnabled) {
        range.text("Deshabilitar invitación", async (ctx) => {
          await disableJoinCode(ensembleId);
          ctx.menu.update();
          await ctx.reply(
            "El código de invitación se ha deshabilitado con éxito."
          );
        });
      }
      range
        .row()
        .text("Eliminar", async (ctx) => {
          ctx.session.ensembleId = ensembleId;
          await ctx.reply("¿Seguro que quieres eliminar la agrupación?", {
            reply_markup: deleteConfirmationMenu,
          });
        })
        .row();
    }
    range
      .text("Miembros", async (ctx) => {
        const ensembleName = await getEnsembleName({ ensembleId });
        if (!ensembleName) return;
        const members = await getMembers(ensembleId);
        await ctx.reply(
          ctx.templates.ensembleMembersTemplate({ members, ensembleName }),
          { parse_mode: "HTML" }
        );
      })
      .row()
      .text("Mi inscripción", async (ctx) => {
        const myMembershipId = await getMyMembershipId(ctx.userId, ensembleId);
        if (!myMembershipId) return;
        await printMembershipHandler(myMembershipId)(ctx);
      });
    range.text("Eventos", async (ctx) => {
      await listEventsHandler(ensembleId)(ctx);
    });
  }
);

const deleteConfirmationMenu = new Menu<MyContext>(
  "ensembleDeleteConfirmationMenu"
).dynamic((ctx, range) => {
  const { ensembleId } = ctx.session;
  if (!ensembleId) {
    return;
  }
  range
    .text("Sí", async (ctx) => {
      await deleteEnsembleHandler(ensembleId)(ctx);
      ctx.menu.close();
    })
    .text("No", (ctx) => ctx.deleteMessage());
});

ensembleMenu.register(deleteConfirmationMenu);
ensembleMenu.register(membershipMenu);
