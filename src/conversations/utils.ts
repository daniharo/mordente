import { MyContext } from "../context";
import { Conversation } from "@grammyjs/conversations";
import { parseDateTime, parseOnlyDate } from "../utils/dateUtils";

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

export async function getDateTime(
  conversation: MyConversation,
  ctx: MyContext
) {
  let dateString = await getTextOrSkip(conversation, ctx);
  let date: Date | null = null;
  while (dateString && !date) {
    const _date = parseDateTime(dateString);
    const valid = !isNaN(_date.getTime());
    if (valid) {
      date = _date;
    } else {
      await ctx.reply(
        "Esa fecha y hora no está en formato 'día/mes/año HH:MM' o no existe.\n" +
          "Por favor, envíamela de nuevo en ese formato, por ejemplo 01/02/2023 14:00"
      );
      dateString = await getTextOrSkip(conversation, ctx);
    }
  }
  await removeSkipButton(ctx);
  return date;
}
