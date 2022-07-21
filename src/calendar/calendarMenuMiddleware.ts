import { Composer, Context, MiddlewareFn, MiddlewareObj } from "grammy";
import { CalendarHelper, CalendarOptions } from "./CalendarHelper";
import { InlineKeyboardMarkup } from "@grammyjs/types";

export class Calendar<T extends CustomContext = CustomContext>
  implements InlineKeyboardMarkup, MiddlewareObj<T>
{
  private readonly extractOptions: (ctx: T) => Partial<CalendarOptions>;

  constructor(extractOptions: (ctx: T) => Partial<CalendarOptions>) {
    this.extractOptions = extractOptions;
  }

  public readonly inline_keyboard = new Proxy([], {
    get: () => {
      throw new Error(
        "Cannot send Calendar menu! Did you forget to use bot.use() for it?"
      );
    },
  });

  private prepare(payload: Record<string, unknown>, ctx: T) {
    if (payload.reply_markup instanceof Calendar) {
      const options = this.extractOptions(ctx);
      payload.reply_markup = new CalendarHelper(options).getCalendarMarkup(
        options.startDate ?? new Date()
      );
    }
  }

  middleware(): MiddlewareFn<T> {
    const CalendarComposer = new Composer<T>((ctx, next) => {
      ctx.api.config.use(async (prev, method, payload, signal) => {
        const p: Record<string, unknown> = payload;
        if (Array.isArray(p.results)) {
          p.results.map((r) => this.prepare(r as Record<string, unknown>, ctx));
        } else {
          this.prepare(p, ctx);
        }
        return await prev(method, payload, signal);
      });
      return next();
    });

    CalendarComposer.callbackQuery(
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

    CalendarComposer.callbackQuery(
      /calendar-telegram-(prev|next)-([\d-]+)/,
      async (ctx) => {
        if (!ctx.match) return;
        const which = ctx.match[1];
        const dateString = ctx.match[2];
        const date = new Date(dateString);
        date.setMonth(
          which === "next" ? date.getMonth() + 1 : date.getMonth() - 1
        );
        await ctx.answerCallbackQuery();
        await ctx.editMessageReplyMarkup({
          reply_markup: new CalendarHelper(
            this.extractOptions(ctx)
          ).getCalendarMarkup(date),
        });
      }
    );

    CalendarComposer.callbackQuery(
      /calendar-telegram-ignore-[\d\w-]+/,
      async (ctx) => {
        await ctx.answerCallbackQuery();
      }
    );
    return CalendarComposer.middleware();
  }
}

export type CalendarContext = {
  calendarSelectedDate?: Date;
};

type CustomContext = Context & CalendarContext;
