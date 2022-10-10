import { Composer } from "grammy";
import { MyContext } from "../context";
import { createConversation } from "@grammyjs/conversations";
import { printEnsembleHandler } from "../handlers/ensemble";
import { createEnsemble } from "../models/ensemble";
import { MyConversation } from "./utils";

export const useCreateEnsemble = new Composer<MyContext>();

export async function createEnsembleConversation(
  conversation: MyConversation,
  ctx: MyContext
) {
  await ctx.reply(ctx.t("create_command_answer"));
  const ensembleName = await conversation.form.text();
  const ensemble = await conversation.external(() =>
    createEnsemble({
      userId: ctx.userId,
      name: ensembleName,
      joinCodeEnabled: true,
    })
  );
  await printEnsembleHandler(ensemble)(ctx);
}

useCreateEnsemble.use(createConversation(createEnsembleConversation));
