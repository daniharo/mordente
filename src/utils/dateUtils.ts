import { format, parse } from "date-fns";

export const parseOnlyTime = (time: string) => parse(time, "H:m", new Date());
export const parseOnlyDate = (date: string) => parse(date, "d/L/y", new Date());
export const parseDateTime = (date: string) =>
  parse(date, "d/L/y H:m", new Date());

export const formatDate = (date: Date) => format(date, "dd/MM/y HH:mm");
