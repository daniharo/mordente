import { Song } from "@prisma/client";
import { MyContext } from "../context";
import { MyConversation } from "../conversations/utils";
import { userIsMember } from "../models/membership";
import { getSong } from "../models/song";
import { songMenu } from "../menus/songMenu";

export const printSongHandler =
  (songId: Song["id"]) =>
  async (ctx: MyContext, conversation?: MyConversation) => {
    const song = await (conversation
      ? conversation.external(() => getSong(songId))
      : getSong(songId));
    if (!song) {
      await ctx.reply("No se ha encontrado la obra.");
      return;
    }
    const getIsMember = () =>
      userIsMember({
        userId: ctx.userId,
        ensembleId: song.ensembleId,
      });
    const isMember = await (conversation
      ? conversation.external(getIsMember)
      : getIsMember());
    if (!isMember) {
      await ctx.reply("No participas en la agrupación.");
      return;
    }
    ctx.session.songId = songId;
    await ctx.reply(`Obra: ${song.name}`, {
      reply_markup: songMenu,
    });
  };
