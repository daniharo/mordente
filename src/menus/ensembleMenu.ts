import { Menu } from "@grammyjs/menu";
import {
  disableJoinCode,
  enableAndGetJoinCode,
  getEnsemble,
  getEnsembleJoinCode,
  getEnsembleName,
} from "../utils/models/ensemble";
import { MyContext } from "../context";
import {
  deleteEnsembleHandler,
  printJoinCodeHandler,
} from "../handlers/ensemble";
import { isAdmin } from "../utils/models/admin";
import { getMembers, getMyMembershipId } from "../utils/models/membership";
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
      if (ensemble.joinCodeEnabled) {
        range
          .text("Invitar", async (ctx) => {
            const joinCode = await getEnsembleJoinCode(ensembleId);
            if (!joinCode) return;
            await printJoinCodeHandler(joinCode)(ctx);
          })
          .text("Deshabilitar invitación", async (ctx) => {
            await disableJoinCode(ensembleId);
            await ctx.reply(
              "El código de invitación se ha deshabilitado con éxito."
            );
          });
      } else {
        range.text("Habilitar enlace de invitación", async (ctx) => {
          const joinCode = await enableAndGetJoinCode(ensembleId);
          await printJoinCodeHandler(joinCode)(ctx);
        });
      }
      range
        .row()
        .text("Eliminar", async (ctx) => {
          const ensemble = await getEnsemble({ ensembleId });
          if (ensemble) {
            await deleteEnsembleHandler(ensemble)(ctx);
          }
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

ensembleMenu.register(membershipMenu);
