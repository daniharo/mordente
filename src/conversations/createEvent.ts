import { createConversation } from "@grammyjs/conversations";
import { MyContext } from "../context";
import { Composer, InlineKeyboard } from "grammy";
import { isAdmin } from "../models/admin";
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
import { parseOnlyDate, parseOnlyTime } from "../utils/dateUtils";

export const useCreateEvent = new Composer<MyContext>();

async function getTime(conversation: MyConversation, ctx: MyContext) {
  let startTimeString = await getTextOrSkip(conversation, ctx);
  let startTime: Date | null = null;
  while (startTimeString && !startTime) {
    const _startTime = parseOnlyTime(startTimeString);
    const valid = !isNaN(_startTime.getTime());
    if (valid) {
      startTime = _startTime;
    } else {
      await ctx.reply(
        "Esa hora no está en formato HH:MM. Por favor, envíamela de nuevo en ese formato, por ejemplo 18:00"
      );
      startTimeString = await getTextOrSkip(conversation, ctx);
    }
  }
  await removeSkipButton(ctx);
  return startTime;
}

async function getDate(conversation: MyConversation, ctx: MyContext) {
  let dateString = await getTextOrSkip(conversation, ctx);
  let date: Date | null = null;
  while (dateString && !date) {
    const _date = parseOnlyDate(dateString);
    const valid = !isNaN(_date.getTime());
    if (valid) {
      date = _date;
    } else {
      await ctx.reply(
        "Esa fecha no está en formato día/mes/año. Por favor, envíamela de nuevo en ese formato, por ejemplo 01/02/2023"
      );
      dateString = await getTextOrSkip(conversation, ctx);
    }
  }
  await removeSkipButton(ctx);
  return date;
}

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
  const name = await getMandatoryText(conversation);

  const skipMenu = new InlineKeyboard().text("Saltar", SKIP_QUERY);
  await ctx.reply("Ahora dime la descripción del evento", {
    reply_markup: skipMenu,
  });
  const description = await getTextOrSkip(conversation, ctx);

  await ctx.reply("Ahora dime la fecha de inicio en formato día/mes/año");
  const startDate = await getDate(conversation, ctx);

  if (startDate) {
    await ctx.reply("Ahora dime la hora de inicio en formato HH:MM", {
      reply_markup: skipMenu,
    });
    const startTime = await getTime(conversation, ctx);
    if (startTime) {
      startDate.setHours(startTime.getHours(), startTime.getMinutes());
    }
  }

  await ctx.reply(
    "Ahora dime la fecha de fin del evento en formato día/mes/año"
  );
  const endDate = await getDate(conversation, ctx);

  if (endDate) {
    await ctx.reply("Ahora dime la hora de fin en formato HH:MM", {
      reply_markup: skipMenu,
    });
    const endTime = await getTime(conversation, ctx);
    if (endTime) {
      endDate.setHours(endTime.getHours(), endTime.getMinutes());
    }
  }

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
  await ctx.answerCallbackQuery();
  await ctx.editMessageReplyMarkup({});

  if (ctx.callbackQuery?.data === "yes") {
    await assignAllMembers(event.id);
    await ctx.reply("Evento asignado a todos los miembros 👍");
  }

  await ctx.reply("Este es el evento que has creado:");
  await printEventHandler(event.id)(ctx, conversation);
}

useCreateEvent.use(createConversation(createEventConversation));

useCreateEvent.callbackQuery(/create_event_(\d+)/, async (ctx) => {
  const match = ctx?.match?.[1];
  if (!match) return;
  ctx.session.ensembleId = +match;
  await ctx.conversation.enter(createEventConversation.name);
});
