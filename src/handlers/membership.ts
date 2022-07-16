import { MyContext } from "../context";
import { joinEnsemble } from "../utils/models/membership";

export const joinEnsembleHandler =
  (joinCode: string) => async (ctx: MyContext) => {
    const ensemble = await joinEnsemble({ userId: ctx.userId, joinCode });
    if (ensemble) {
      await ctx.reply(ctx.t("join_success", { ensembleName: ensemble.name }));
    } else {
      await ctx.reply(
        "No se encuentra la agrupación solicitada, o el código de acceso no está habilitado."
      );
    }
    return;
  };
