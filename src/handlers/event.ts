import { Ensemble } from "@prisma/client";
import { MyContext } from "../context";
import { userIsMember } from "../utils/models/membership";
import {
  getCurrentEventsForEnsemble,
  getFutureEventsForEnsemble,
} from "../utils/models/event";
import { eventListMenu } from "../menus/eventListMenu";

export const listEventsHandler =
  (ensembleId: Ensemble["id"]) => async (ctx: MyContext) => {
    const isMember = await userIsMember({ userId: ctx.userId, ensembleId });
    if (!isMember) {
      await ctx.reply("No participas en esta agrupación.");
      return;
    }
    const currentEvents = await getCurrentEventsForEnsemble(ensembleId);
    const futureEvents = await getFutureEventsForEnsemble(ensembleId);
    await ctx.reply(
      ctx.templates.eventsSummaryTemplate({ currentEvents, futureEvents }),
      { reply_markup: eventListMenu }
    );
  };
