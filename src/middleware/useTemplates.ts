import * as templates from "../utils/templates";
import { MiddlewareFn } from "grammy";
import { MyContext } from "../context";

const templateKeys = Object.keys(templates) as (keyof typeof templates)[];

/* eslint-disable */
export const useTemplates: MiddlewareFn<MyContext> = async (
  ctx,
  next // is an alias for: () => Promise<void>
) => {
  const templateEntries = templateKeys.map((templateKey) => [
    templateKey,
    (object: any) =>
      templates[templateKey](Object.assign({ t: ctx.t }, object)),
  ]);
  ctx.templates = Object.fromEntries(templateEntries);
  await next();
};
/* eslint-enable */
