import { Composer, InlineKeyboard } from "grammy";
import { MyContext } from "../context";
import { createConversation } from "@grammyjs/conversations";
import { upsertEventAssignationAnswer } from "../models/eventAssignation";
import { getTextOrSkip, MyConversation, SKIP_QUERY } from "./utils";
import { notifyAttendance } from "../notifications/notifyAttendance";

export const useAttendanceConversation = new Composer<MyContext>();

export async function attendanceConversation(
  conversation: MyConversation,
  ctx: MyContext
) {
  const eventId = ctx.session.eventId;
  if (eventId === undefined) return;
  const skipMenu = new InlineKeyboard().text("Saltar", SKIP_QUERY);
  await ctx.reply("¿Por qué no puedes asistir al evento?", {
    reply_markup: skipMenu,
  });
  const answer = await getTextOrSkip(conversation, ctx);
  const assignation = await upsertEventAssignationAnswer(
    eventId,
    ctx.userId,
    "NO",
    answer
  );
  await notifyAttendance(assignation);
}

useAttendanceConversation.use(createConversation(attendanceConversation));
