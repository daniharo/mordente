import { Menu } from "@grammyjs/menu";
import { MyContext } from "../context";
import { isAdmin } from "../models/admin";
import { createSongConversation } from "../conversations/createSong";

export const songListMenu = new Menu<MyContext>("songListMenu").dynamic(
  async (ctx, range) => {
    const { ensembleId } = ctx.session;
    if (!ensembleId) return;
    const userIsAdmin = await isAdmin({ userId: ctx.userId, ensembleId });
    if (userIsAdmin) {
      range.text("Añadir obra", (ctx) =>
        ctx.conversation.enter(createSongConversation.name)
      );
    }
  }
);
