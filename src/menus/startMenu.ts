import { Menu } from "@grammyjs/menu";
import { MyContext } from "../context";
import { createEnsembleHandler } from "../handlers/ensemble";

export const startMenu = new Menu<MyContext>("start")
  .text(
    (ctx) => ctx.t("start_join"),
    async (ctx) => {
      await ctx.reply(
        "Para unirte a una agrupación, abre el enlace que te proporcionen."
      );
    }
  )
  .text((ctx) => ctx.t("start_create"), createEnsembleHandler);
