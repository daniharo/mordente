import { Menu } from "@grammyjs/menu";
import { getEnsemble } from "../utils/models/ensemble";
import { MyContext } from "../context";
import { deleteEnsembleHandler } from "../handlers/ensemble";
import { isAdmin } from "../utils/models/admin";

export const ensembleMenu = new Menu<MyContext>("ensemble").dynamic(
  async (ctx, range) => {
    if (ctx.session.ensembleId) {
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
    }
  }
);
