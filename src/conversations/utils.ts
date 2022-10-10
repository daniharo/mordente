import { MyContext } from "../context";
import { Conversation } from "@grammyjs/conversations";

export type MyConversation = Conversation<MyContext>;

export const SKIP_QUERY = "skip";

export const removeSkipButton = async (ctx: MyContext) => {
  if (ctx.callbackQuery?.data === SKIP_QUERY) {
    await ctx.answerCallbackQuery("¡Siguiente paso!");
    await ctx.editMessageReplyMarkup();
  }
};

export async function getTextOrSkip(
  conversation: MyConversation,
  ctx: MyContext
) {
  ctx = await conversation.waitUntil(
    (ctx) => !!ctx.msg?.text || ctx.callbackQuery?.data === SKIP_QUERY,
    (ctx) =>
      ctx.reply(
        "Eso no es un mensaje de texto... Por favor, envíamelo de nuevo en un mensaje de texto"
      )
  );
  await removeSkipButton(ctx);
  return ctx.callbackQuery?.data ? undefined : ctx.msg?.text;
}

export async function getMandatoryText(conversation: MyConversation) {
  return conversation.form.text((ctx) =>
    ctx.reply(
      "Eso no es un mensaje de texto... Por favor, envíamelo de nuevo en un mensaje de texto"
    )
  );
}
