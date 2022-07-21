import { Ensemble, Event } from "@prisma/client";
import { MyContext } from "../context";
import { userIsMember } from "../models/membership";
import {
  getCurrentEventsForEnsemble,
  getEvent,
  getFutureEventsForEnsemble,
} from "../models/event";
import { InlineKeyboard } from "grammy";
import { isAdmin } from "../models/admin";
import { eventMenu } from "../menus/eventMenu";

export const listEventsHandler =
  (ensembleId: Ensemble["id"]) => async (ctx: MyContext) => {
    const isMember = await userIsMember({ userId: ctx.userId, ensembleId });
    if (!isMember) {
      await ctx.reply("No participas en esta agrupación.");
      return;
    }
    const currentEvents = await getCurrentEventsForEnsemble(ensembleId);
    const futureEvents = await getFutureEventsForEnsemble(ensembleId);
    const userIsAdmin = await isAdmin({ userId: ctx.userId, ensembleId });
    const menu = userIsAdmin
      ? new InlineKeyboard().text("Crear evento", `create_event_${ensembleId}`)
      : undefined;
    await ctx.reply(
      ctx.templates.eventsSummaryTemplate({ currentEvents, futureEvents }),
      { reply_markup: menu, parse_mode: "HTML" }
    );
  };

export const printEventHandler =
  (eventId: Event["id"]) => async (ctx: MyContext) => {
    const event = await getEvent(eventId);
    if (!event) {
      await ctx.reply("No se ha encontrado el evento.");
      return;
    }
    const isMember = await userIsMember({
      userId: ctx.userId,
      ensembleId: event.ensembleId,
    });
    if (!isMember) {
      await ctx.reply("No participas en la agrupación.");
      return;
    }
    ctx.session.eventId = eventId;
    await ctx.reply(ctx.templates.eventDetailTemplate({ event }), {
      parse_mode: "HTML",
      reply_markup: eventMenu,
    });
  };
