import { getMandatoryText, MyConversation } from "./utils";
import { MyContext } from "../context";
import { getFileUrl, uploadFile } from "../s3/s3helper";
import { createSong, updateSongPath } from "../models/song";

export async function createSongConversation(
  conversation: MyConversation,
  ctx: MyContext
) {
  const { ensembleId } = ctx.session;
  if (!ensembleId) return;
  await ctx.reply("Primero dime el nombre de la obra");
  const name = await getMandatoryText(conversation);
  const song = await conversation.external(() => createSong(ensembleId, name));
  await ctx.reply("Ahora envíame el archivo, por favor");
  ctx = await conversation.waitFor("message:document");
  const file = await ctx.getFile();
  const fileName = ctx.msg?.document?.file_name;
  const mimeType = ctx.msg?.document?.mime_type;
  const path = await file.download();
  const s3Key = `${ensembleId}/${song.id}/${fileName ?? `${song.id}.pdf`}`;
  await conversation.external(() => uploadFile(s3Key, path, mimeType));
  await conversation.external(() => updateSongPath(song.id, s3Key));
  await ctx.reply(`Obra subida con éxito ✅`);
}
