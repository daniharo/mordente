import { CallbackQueryMiddleware, Composer } from "grammy";
import { CalendarHelper } from "./CalendarHelper";
import { MyContext } from "../context";

export const useCalendar = new Composer<MyContext>();

const prevNextMiddleware: (
  which: "prev" | "next"
) => CallbackQueryMiddleware<MyContext> = (which) => async (ctx) => {
  if (!ctx.match) return;
  const dateString = ctx.match[1];
  const date = new Date(dateString);
  date.setMonth(which === "next" ? date.getMonth() + 1 : date.getMonth() - 1);
  await ctx.answerCallbackQuery();
  await ctx.editMessageReplyMarkup({
    reply_markup: new CalendarHelper({}).getCalendarMarkup(date),
  });
};

useCalendar.callbackQuery(
  /calendar-telegram-date-([\d-]+)/,
  async (ctx, next) => {
    if (!ctx.match) return;
    const dateString = ctx.match[1];
    ctx.calendarSelectedDate = new Date(dateString);
    await ctx.answerCallbackQuery();
    await ctx.editMessageReplyMarkup();
    await next();
  }
);

useCalendar.callbackQuery(
  /calendar-telegram-next-([\d-]+)/,
  prevNextMiddleware("next")
);

useCalendar.callbackQuery(
  /calendar-telegram-prev-([\d-]+)/,
  prevNextMiddleware("prev")
);

useCalendar.callbackQuery(/calendar-telegram-ignore-[\d\w-]+/, async (ctx) => {
  await ctx.answerCallbackQuery();
});

export type CalendarContext = {
  calendarSelectedDate: Date;
};
