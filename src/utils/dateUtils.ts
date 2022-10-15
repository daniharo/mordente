import { parse } from "date-fns";

export const parseOnlyTime = (time: string) => parse(time, "H:m", new Date());
