import { createConversation } from "@grammyjs/conversations";
import { MyContext } from "../context";
import { Composer, InlineKeyboard } from "grammy";
import { isAdmin } from "../models/admin";
import { calendarMenu } from "../menus/calendarMenu";
import { createEvent } from "../models/event";
import { printEventHandler } from "../handlers/event";
import {
  getMandatoryText,
  getTextOrSkip,
  MyConversation,
  removeSkipButton,
  SKIP_QUERY,
} from "./utils";
import { assignAllMembers } from "../models/eventAssignation";

export const useCreateEvent = new Composer<MyContext>();

export async function createEventConversation(
  conversation: MyConversation,
  ctx: MyContext
) {
  const ensembleId = ctx.session.ensembleId;
  if (!ensembleId) {
    await ctx.reply("Error: ID de agrupación no definido");
    return;
  }
  const userIsAdmin = await conversation.external(() =>
    isAdmin({ userId: ctx.userId, ensembleId })
  );
  if (!userIsAdmin) {
    await ctx.reply(
      "No tienes permisos para crear eventos en esta agrupación."
    );
    return;
  }
  await ctx.reply("Por favor, dime el nombre del evento");
  ctx = await conversation.wait();
  const name = await getMandatoryText(conversation);

  const skipMenu = new InlineKeyboard().text("Saltar", SKIP_QUERY);
  await ctx.reply("Ahora dime la descripción del evento", {
    reply_markup: skipMenu,
  });
  const description = await getTextOrSkip(conversation, ctx);

  ctx.session.calendarOptions = {
    shortcutButtons: skipMenu.inline_keyboard[0],
  };
  await ctx.reply("Ahora dime la fecha de inicio", {
    reply_markup: calendarMenu,
  });
  ctx = await conversation.waitUntil(
    (ctx) =>
      !!ctx.calendarSelectedDate || ctx.callbackQuery?.data === SKIP_QUERY
  );
  await removeSkipButton(ctx);
  const startDate = ctx.calendarSelectedDate;

  ctx.session.calendarOptions.minDate = startDate;
  await ctx.reply("Ahora dime la fecha de fin del evento", {
    reply_markup: calendarMenu,
  });
  ctx = await conversation.waitUntil(
    (ctx) =>
      !!ctx.calendarSelectedDate || ctx.callbackQuery?.data === SKIP_QUERY
  );
  await removeSkipButton(ctx);
  const endDate = ctx.calendarSelectedDate;

  await ctx.reply("Ahora dime el tipo del evento (ensayo, concierto...)", {
    reply_markup: skipMenu,
  });
  const eventType = await getTextOrSkip(conversation, ctx);

  const publishMenu = new InlineKeyboard().text("Sí", "yes").text("No", "no");
  await ctx.reply(
    "Datos guardados. ¿Quieres publicar ya el evento? Si seleccionas que no, se guardará como plantilla.",
    { reply_markup: publishMenu }
  );
  ctx = await conversation.waitUntil(
    (ctx) =>
      ctx.callbackQuery?.data === "yes" || ctx.callbackQuery?.data === "no"
  );
  const publish = ctx.callbackQuery?.data === "yes";

  const event = await conversation.external(() =>
    createEvent({
      name,
      description,
      eventType,
      startDate,
      endDate,
      status: publish ? "PUBLISHED" : "DRAFT",
      ensemble: { connect: { id: ctx.session.ensembleId } },
    })
  );

  await printEventHandler(event.id)(ctx, conversation);

  const assignMenu = new InlineKeyboard()
    .text("Sí", "yes")
    .row()
    .text("No, asignaré manualmente", "no")
    .row();
  await ctx.reply("¿Quieres asignar el evento a todos los miembros?", {
    reply_markup: assignMenu,
  });
  ctx = await conversation.waitUntil(
    (ctx) =>
      ctx.callbackQuery?.data === "yes" || ctx.callbackQuery?.data === "no"
  );
  await ctx.editMessageReplyMarkup();

  await assignAllMembers(event.id);
}

useCreateEvent.use(createConversation(createEventConversation));

useCreateEvent.callbackQuery(/create_event_(\d+)/, async (ctx) => {
  const match = ctx?.match?.[1];
  if (!match) return;
  ctx.session.ensembleId = +match;
  await ctx.conversation.enter(createEventConversation.name);
});
