import { Composer } from "grammy";
import { MyContext } from "../context";
import { Menu } from "@grammyjs/menu";
import { isAdmin } from "../models/admin";
import { getMandatoryText, MyConversation } from "../conversations/utils";
import { createConversation } from "@grammyjs/conversations";
import { getSong, updateSong } from "../models/song";

const SUCCESS_MESSAGE = "Se ha actualizado la obra correctamente 🎉";

const CONVERSATIONS = {
  EDIT_NAME: { name: "EDIT_SONG_NAME", conversation: editSongNameConversation },
} as const;

export const useEditSong = new Composer<MyContext>();

export const editSongMenu = new Menu<MyContext>("editSongMenu").dynamic(
  async (ctx, range) => {
    const { songId } = ctx.session;
    if (songId === undefined) {
      return;
    }
    const song = await getSong(songId);
    if (!song) {
      return;
    }
    const userIsAdmin = await isAdmin({
      userId: ctx.userId,
      ensembleId: song.ensembleId,
    });
    if (!userIsAdmin) {
      return;
    }
    range
      .text("Cambiar nombre", (ctx) =>
        ctx.conversation.enter(CONVERSATIONS.EDIT_NAME.name)
      )
      .row()
      .text("🔙 Volver", (ctx) => ctx.menu.back());
  }
);

async function editSongNameConversation(
  conversation: MyConversation,
  ctx: MyContext
) {
  const { songId } = ctx.session;
  if (songId === undefined) {
    return;
  }
  await ctx.reply("Escribe el nuevo nombre de la obra");
  const name = await getMandatoryText(conversation);
  await conversation.external(() => updateSong(songId, { name }));
  await ctx.reply(SUCCESS_MESSAGE);
}

const conversationKeys = Object.keys(
  CONVERSATIONS
) as (keyof typeof CONVERSATIONS)[];

conversationKeys.forEach((key) => {
  const { name, conversation } = CONVERSATIONS[key];
  useEditSong.use(createConversation(conversation, name));
});

useEditSong.use(editSongMenu);
