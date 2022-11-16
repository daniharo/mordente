import { Menu } from "@grammyjs/menu";
import { MyContext } from "../context";
import { deleteSong, getSong } from "../models/song";
import { isAdmin } from "../models/admin";
import { deleteFile, getFileUrl } from "../s3/s3helper";
import { editSongMenu } from "../composers/useEditSong";

export const songMenu = new Menu<MyContext>("songMenu").dynamic(
  async (ctx, range) => {
    const { songId } = ctx.session;
    if (!songId) return;
    const song = await getSong(songId);
    if (!song) return;
    const userIsAdmin = await isAdmin({
      userId: ctx.userId,
      ensembleId: song.ensembleId,
    });
    if (userIsAdmin) {
      range
        .text("Editar", (ctx) => ctx.menu.nav("editSongMenu"))
        .text("Eliminar", async (ctx) => {
          const song = await deleteSong(songId);
          if (song.link) {
            await deleteFile(song.link);
          }
          await ctx.reply("La obra ha sido eliminada correctamente.");
        })
        .row();
    }
    const fileName = song.link;
    if (fileName) {
      range.text("Ver partitura", async (ctx) => {
        const url = await getFileUrl(fileName);
        return ctx.replyWithDocument(url, {
          caption: "Aquí tienes la partitura 🎼",
        });
      });
    }
  }
);
songMenu.register(editSongMenu);
