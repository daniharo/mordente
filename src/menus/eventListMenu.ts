import { Menu } from "@grammyjs/menu";
import { MyContext } from "../context";

export const eventListMenu = new Menu<MyContext>("eventListMenu").text(
  "Crear evento",
  async (ctx) => {}
);
