import { Bot, session } from "grammy";
import dotenv from "dotenv";
import { useFluent } from "@grammyjs/fluent";
import fluent from "./locales/fluent";
import { MyContext, SessionData } from "./context";
import { useTemplates } from "./middleware/templates";
import { startMenu } from "./menus/startMenu";
import { createEnsemble, getEnsemble } from "./utils/models/ensemble";
import { analizeCommand, getCommandFromMessage } from "./utils/commandHandler";
import { Router } from "@grammyjs/router";
import {
  createEnsembleHandler,
  printEnsembleHandler,
} from "./handlers/ensemble";
import { ensembleMenu } from "./menus/ensembleMenu";
import { useAccount } from "./middleware/accountMiddleware";
import { joinEnsembleHandler } from "./handlers/membership";

dotenv.config();

function createInitialSessionData(): SessionData {
  return { step: "idle", userId: undefined };
}

const bot = new Bot<MyContext>(process.env.BOT_TOKEN ?? "");
bot.use(session({ initial: createInitialSessionData }));
bot.use(useFluent({ fluent }));
bot.use(useTemplates);
bot.use(useAccount);
bot.use(startMenu);
bot.use(ensembleMenu);

bot.api.setMyCommands([
  { command: "start", description: "Start the bot" },
  { command: "list", description: "List words" },
  { command: "add", description: "Add a word" },
  { command: "delete", description: "Delete a word" },
]);

bot.command("start", async (ctx) => {
  const joinCode = ctx.match;
  if (joinCode) {
    await joinEnsembleHandler(joinCode)(ctx);
    return;
  }
  await ctx.reply(ctx.t("start_command_answer"), { reply_markup: startMenu });
});

bot.command("join", async (ctx) => {
  await ctx.reply(
    "Para unirte a una agrupación, tienes que acceder al enlace que te hayan proporcionado."
  );
});

bot.command("create", async (ctx) => {
  await createEnsembleHandler(ctx);
});

bot.command("cancel", async (ctx) => {
  ctx.session.step = "idle";
  await ctx.reply(ctx.t("operation_cancelled"));
});

bot.on("message:entities:bot_command", async (ctx) => {
  const commandText = getCommandFromMessage(ctx.msg)!;
  const command = analizeCommand(commandText);

  if (!command?.id) {
    return;
  }

  switch (command?.type) {
    case "ensemble":
      const ensemble = await getEnsemble({ ensembleId: command?.id });
      if (!ensemble) {
        await ctx.reply("Agrupación no encontrada");
        break;
      }
      await printEnsembleHandler(ensemble)(ctx);
      break;
  }
});

const router = new Router<MyContext>((ctx) => ctx.session.step);

router.route("create_ensemble_name", async (ctx) => {
  const ensembleName = ctx.msg?.text;
  if (!ensembleName) return;
  const ensemble = await createEnsemble({
    userId: ctx.userId,
    name: ensembleName,
    joinCodeEnabled: true,
  });
  await printEnsembleHandler(ensemble)(ctx);
  ctx.session.step = "idle";
});

bot.use(router);
bot.start();
