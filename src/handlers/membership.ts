import { MyContext } from "../context";
import { joinEnsemble } from "../utils/models/membership";
import { printEnsembleHandler } from "./ensemble";

export const joinEnsembleHandler =
  (joinCode: string) => async (ctx: MyContext) => {
    const ensemble = await joinEnsemble({ userId: ctx.userId, joinCode });
    if (ensemble) {
      await ctx.reply(ctx.t("join_success", { ensembleName: ensemble.name }));
      await printEnsembleHandler(ensemble)(ctx);
    } else {
      await ctx.reply(ctx.t("join_error"));
    }
    return;
  };
