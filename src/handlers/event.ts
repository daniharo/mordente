import { Ensemble, Event } from "@prisma/client";
import { MyContext } from "../context";
import { userIsMember } from "../models/membership";
import { getCurrentEvents, getEvent, getFutureEvents } from "../models/event";
import { InlineKeyboard } from "grammy";
import { isAdmin } from "../models/admin";
import { eventMenu } from "../menus/eventMenu";
import { MyConversation } from "../conversations/utils";
import { eventDetailTemplate } from "../utils/templates";

export const listEventsHandler =
  (ensembleId: Ensemble["id"]) => async (ctx: MyContext) => {
    const isMember = await userIsMember({ userId: ctx.userId, ensembleId });
    if (!isMember) {
      await ctx.reply("No participas en esta agrupación.");
      return;
    }
    const currentEvents = await getCurrentEvents(ensembleId, ctx.userId);
    const futureEvents = await getFutureEvents(ensembleId, ctx.userId);
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
  (eventId: Event["id"]) =>
  async (ctx: MyContext, conversation?: MyConversation) => {
    const event = await (conversation
      ? conversation.external(() => getEvent(eventId))
      : getEvent(eventId));
    if (!event) {
      await ctx.reply("No se ha encontrado el evento.");
      return;
    }
    const getIsMember = () =>
      userIsMember({
        userId: ctx.userId,
        ensembleId: event.ensembleId,
      });
    const isMember = await (conversation
      ? conversation.external(getIsMember)
      : getIsMember());
    if (!isMember) {
      await ctx.reply("No participas en la agrupación.");
      return;
    }
    ctx.session.eventId = eventId;
    await ctx.reply(eventDetailTemplate({ t: ctx.t, event }), {
      parse_mode: "HTML",
      reply_markup: eventMenu,
    });
  };
