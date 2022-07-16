import { Context, SessionFlavor } from "grammy";
import { FluentContextFlavor } from "@grammyjs/fluent";
import * as templates from "../utils/templates";
import { Ensemble } from "@prisma/client";
import {
  AccountContextFlavor,
  AccountSessionData,
} from "../middleware/accountMiddleware";

export interface SessionData extends AccountSessionData {
  step: "idle" | "create_ensemble_name";
  ensembleId?: Ensemble["id"];
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
  AccountContextFlavor &
  TemplateContext;
