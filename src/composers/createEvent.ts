import { Composer, InlineKeyboard, Middleware } from "grammy";
import { Router } from "@grammyjs/router";
import { MyContext } from "../context";
import { publishEventMenu } from "../menus/publishEventMenu";

export const CREATE_EVENT_STEPS = {
  NAME: "create_event_name",
  DESCRIPTION: "create_event_description",
  TYPE: "create_event_type",
  PUBLISH: "create_event_publish",
} as const;

export const useCreateEvent = new Composer<MyContext>();

useCreateEvent.use(publishEventMenu);
useCreateEvent.on("callback_query:data", async (ctx) => {
  const match = /create_event_(\d+)/.exec(ctx.callbackQuery.data)?.[1];
  if (match) {
    ctx.session.ensembleId = +match;
    ctx.session.step = CREATE_EVENT_STEPS.NAME;
    await ctx.reply("Por favor, dime el nombre del evento");
  }
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
description.on(["callback_query:data", "message:text"], async (ctx) => {
  if (
    ctx.callbackQuery &&
    ctx.callbackQuery.data !== `skip_${CREATE_EVENT_STEPS.DESCRIPTION}`
  ) {
    return;
  }
  ctx.session.createEvent.description = ctx.msg?.text;
  ctx.session.step = CREATE_EVENT_STEPS.DESCRIPTION;
  await ctx.reply("Ahora dime el tipo del evento (ensayo, concierto...)", {
    reply_markup: getSkipMenu(CREATE_EVENT_STEPS.TYPE),
  });
});
description.use(notTextMiddleware);

const type = router.route(CREATE_EVENT_STEPS.TYPE);
type.on(["callback_query:data", "message:text"], async (ctx) => {
  if (
    ctx.callbackQuery &&
    ctx.callbackQuery.data !== `skip_${CREATE_EVENT_STEPS.TYPE}`
  ) {
    return;
  }
  ctx.session.createEvent.eventType = ctx.msg?.text;
  ctx.session.step = CREATE_EVENT_STEPS.PUBLISH;
  await ctx.reply(
    "Datos guardados. ¿Quieres publicar ya el evento? Si seleccionas que no, se guardará como plantilla.",
    { reply_markup: publishEventMenu }
  );
});
type.use(notTextMiddleware);

const getSkipMenu = (step: string) =>
  new InlineKeyboard().text("Saltar", `skip_${step}`);
