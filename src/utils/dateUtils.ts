import { parse } from "date-fns";

export const parseOnlyTime = (time: string) => parse(time, "H:m", new Date());
export const parseOnlyDate = (date: string) => parse(date, "d/L/y", new Date());
