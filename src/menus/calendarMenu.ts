import { Calendar } from "../calendar/calendarMenuMiddleware";
import { MyContext } from "../context";

export const calendarMenu = new Calendar<MyContext>(
  (ctx) => ctx.session.calendarOptions
);
