import { Menu } from "@grammyjs/menu";
import { MyContext } from "../context";
import { createEnsembleHandler } from "../utils/handlers";

export const startMenu = new Menu<MyContext>("start")
  .text((ctx) => ctx.t("start_join"))
  .text((ctx) => ctx.t("start_create"), createEnsembleHandler);
