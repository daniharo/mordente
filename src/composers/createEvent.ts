import {
  CallbackQueryMiddleware,
  Composer,
  InlineKeyboard,
  Middleware,
} from "grammy";
import { Router } from "@grammyjs/router";
import { MyContext } from "../context";
import { publishEventMenu } from "../menus/publishEventMenu";
import { CalendarHelper } from "../calendar/CalendarHelper";
import { isAdmin } from "../utils/models/admin";

export const CREATE_EVENT_STEPS = {
  NAME: "create_event_name",
  DESCRIPTION: "create_event_description",
  START_DATE: "create_event_start_date",
  END_DATE: "create_event_end_date",
  TYPE: "create_event_type",
  PUBLISH: "create_event_publish",
} as const;

const getSkipCallbackQueryData = (step: string) => `skip_${step}`;
const skipCallbackQueryMiddleware: CallbackQueryMiddleware<MyContext> = async (
  ctx,
  next
) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageReplyMarkup();
  await next();
};

export const useCreateEvent = new Composer<MyContext>();

useCreateEvent.use(publishEventMenu);
useCreateEvent.callbackQuery(/create_event_(\d+)/, async (ctx) => {
  const match = ctx?.match?.[1];
  if (!match) return;
  const ensembleId = +match;
  const userIsAdmin = await isAdmin({ userId: ctx.userId, ensembleId });
  if (!userIsAdmin) {
    await ctx.reply(
      "No tienes permisos para crear eventos en esta agrupación."
    );
    return;
  }
  ctx.session.ensembleId = ensembleId;
  ctx.session.step = CREATE_EVENT_STEPS.NAME;
  await ctx.reply("Por favor, dime el nombre del evento");
});

const router = new Router<MyContext>((ctx) => ctx.session.step);
useCreateEvent.use(router);

const notTextMiddleware: Middleware<MyContext> = async (ctx) => {
  await ctx.reply(
    "Eso no es un mensaje de texto... Por favor, envíamelo de nuevo en un mensaje de texto"
  );
};

const name = router.route(CREATE_EVENT_STEPS.NAME);
name.on("message:text", async (ctx) => {
  ctx.session.createEvent.name = ctx.msg.text;
  ctx.session.step = CREATE_EVENT_STEPS.DESCRIPTION;
  await ctx.reply("Ahora dime la descripción del evento", {
    reply_markup: getSkipMenu(CREATE_EVENT_STEPS.DESCRIPTION),
  });
});
name.use(notTextMiddleware);

const description = router.route(CREATE_EVENT_STEPS.DESCRIPTION);
description.callbackQuery(
  getSkipCallbackQueryData(CREATE_EVENT_STEPS.DESCRIPTION),
  skipCallbackQueryMiddleware
);
description.on(["callback_query:data", "message:text"]).filter(
  (ctx) =>
    !ctx.callbackQuery ||
    ctx.callbackQuery.data ===
      getSkipCallbackQueryData(CREATE_EVENT_STEPS.DESCRIPTION),
  async (ctx) => {
    ctx.session.createEvent.description = ctx.msg?.text;
    ctx.session.step = CREATE_EVENT_STEPS.START_DATE;
    await ctx.reply("Ahora dime la fecha de inicio", {
      reply_markup: new CalendarHelper({
        shortcutButtons: getSkipMenu(CREATE_EVENT_STEPS.START_DATE)
          .inline_keyboard[0],
      }).getCalendarMarkup(new Date()),
    });
  }
);
description.use(notTextMiddleware);

const startDate = router.route(CREATE_EVENT_STEPS.START_DATE);
startDate.callbackQuery(
  getSkipCallbackQueryData(CREATE_EVENT_STEPS.START_DATE),
  skipCallbackQueryMiddleware
);
startDate.on("callback_query:data").filter(
  (ctx) =>
    !!ctx.calendarSelectedDate ||
    ctx.callbackQuery.data ===
      getSkipCallbackQueryData(CREATE_EVENT_STEPS.START_DATE),
  async (ctx) => {
    ctx.session.createEvent.startDate = ctx.calendarSelectedDate;
    ctx.session.step = CREATE_EVENT_STEPS.TYPE;
    await ctx.reply("Ahora dime el tipo del evento (ensayo, concierto...)", {
      reply_markup: getSkipMenu(CREATE_EVENT_STEPS.TYPE),
    });
  }
);

const type = router.route(CREATE_EVENT_STEPS.TYPE);
type.callbackQuery(
  getSkipCallbackQueryData(CREATE_EVENT_STEPS.TYPE),
  skipCallbackQueryMiddleware
);
type.on(["callback_query:data", "message:text"]).filter(
  (ctx) =>
    !ctx.callbackQuery ||
    ctx.callbackQuery.data ===
      getSkipCallbackQueryData(CREATE_EVENT_STEPS.TYPE),
  async (ctx) => {
    ctx.session.createEvent.eventType = ctx.msg?.text;
    ctx.session.step = CREATE_EVENT_STEPS.PUBLISH;
    await ctx.reply(
      "Datos guardados. ¿Quieres publicar ya el evento? Si seleccionas que no, se guardará como plantilla.",
      { reply_markup: publishEventMenu }
    );
  }
);
type.use(notTextMiddleware);

const getSkipMenu = (step: string) =>
  new InlineKeyboard().text("Saltar", getSkipCallbackQueryData(step));
