import { getMandatoryText, MyConversation } from "./utils";
import { MyContext } from "../context";
import { uploadFile } from "../s3/s3helper";
import { createSong, updateSongPath } from "../models/song";

export async function createSongConversation(
  conversation: MyConversation,
  ctx: MyContext
) {
  const { ensembleId } = ctx.session;
  if (!ensembleId) return;
  await ctx.reply("Primero dime el nombre de la obra");
  const name = await getMandatoryText(conversation);
  const song = await createSong(ensembleId, name);
  await ctx.reply("Ahora envíame el archivo, por favor");
  ctx = await conversation.waitFor("message:document");
  const file = await ctx.getFile();
  const path = await file.download();
  const fileName = path.split("/").pop() ?? path;
  const nameTokens = fileName.split(".");
  const extension =
    nameTokens.length > 1 ? `.${nameTokens[nameTokens.length - 1]}` : "";
  const s3Key = `${ensembleId}/${song.id}${extension}`;
  await conversation.external(() => uploadFile(s3Key, path));
  await conversation.external(() => updateSongPath(song.id, s3Key));
  await ctx.reply("Obra subida con éxito");
}
