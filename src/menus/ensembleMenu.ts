import { Menu } from "@grammyjs/menu";
import { getEnsemble } from "../utils/models/ensemble";
import { MyContext } from "../context";
import { deleteEnsembleHandler } from "../handlers/ensemble";

export const ensembleMenu = new Menu<MyContext>("ensemble")
  .text(
    {
      text: "Eliminar",
      payload: (ctx) => ctx.session.ensembleId?.toString() ?? "",
    },
    async (ctx, next) => {
      if (ctx.match) {
        const ensemble = await getEnsemble({ ensembleId: +ctx.match });
        if (ensemble) {
          await deleteEnsembleHandler(ensemble)(ctx, next);
        }
      }
    }
  )
  .row();
