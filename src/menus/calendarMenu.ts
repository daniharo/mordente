import { Calendar } from "grammy-calendar";
import { MyContext } from "../context";

export const calendarMenu = new Calendar<MyContext>(
  (ctx) => ctx.session.calendarOptions
);
