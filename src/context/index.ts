import { Context, SessionFlavor } from "grammy";
import { FluentContextFlavor } from "@grammyjs/fluent";
import * as templates from "../utils/templates";

export interface SessionData {
  step: "idle" | "create_ensemble_name";
}

type Templates = {
  [p in keyof typeof templates]: (
    locale: Omit<Parameters<typeof templates[p]>[0], "t">
  ) => string;
};

export interface TemplateContext {
  templates: Templates;
}

export type MyContext = Context &
  SessionFlavor<SessionData> &
  FluentContextFlavor &
  TemplateContext;
