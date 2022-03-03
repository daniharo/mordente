import * as templates from "../utils/templates";
import { NextFunction } from "grammy";
import { MyContext } from "../context";

export async function useTemplates(
  ctx: MyContext,
  next: NextFunction // is an alias for: () => Promise<void>
): Promise<void> {
  const templateKeys = Object.keys(templates) as (keyof typeof templates)[];
  const templateEntries = templateKeys.map((templateKey) => [
    templateKey,
    (object: any) =>
      templates[templateKey](Object.assign({ t: ctx.t }, object)),
  ]);
  ctx.templates = Object.fromEntries(templateEntries);
  await next();
}