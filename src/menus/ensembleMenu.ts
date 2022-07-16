import { Menu } from "@grammyjs/menu";
import { getEnsemble, getEnsembleName } from "../utils/models/ensemble";
import { MyContext } from "../context";
import { deleteEnsembleHandler } from "../handlers/ensemble";
import { isAdmin } from "../utils/models/admin";
import { getMembers } from "../utils/models/membership";

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
      range
        .text(
          {
            text: "Eliminar",
            payload: (ctx) => ctx.session.ensembleId?.toString() ?? "",
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
  .text("Miembros", async (ctx) => {
    const { ensembleId } = ctx.session;
    if (!ensembleId) {
      return;
    }
    const ensembleName = await getEnsembleName({ ensembleId });
    if (!ensembleName) return;
    const members = await getMembers(ensembleId);
    await ctx.reply(
      ctx.templates.ensembleMembersTemplate({ members, ensembleName })
    );
  });
