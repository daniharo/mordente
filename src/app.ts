import { Bot, session } from "grammy";
import dotenv from "dotenv";
import { useFluent } from "@grammyjs/fluent";
import fluent from "./locales/fluent";
import { MyContext, SessionData } from "./context";
import { useTemplates } from "./middleware/templates";
import { startMenu } from "./menus/startMenu";
import { createUser, getUser, getUserIdFromUID } from "./utils/models/user";
import { joinEnsemble } from "./utils/models/membership";
import { createEnsemble, getEnsemble } from "./utils/models/ensemble";
import { analizeCommand, getCommandFromMessage } from "./utils/commandHandler";
import { Router } from "@grammyjs/router";
import {
  createEnsembleHandler,
  printEnsembleHandler,
} from "./handlers/ensemble";
import { ensembleMenu } from "./menus/ensembleMenu";

dotenv.config();

function createInitialSessionData(): SessionData {
  return { step: "idle" };
}

const bot = new Bot<MyContext>(process.env.BOT_TOKEN ?? "");
bot.use(session({ initial: createInitialSessionData }));
bot.use(useFluent({ fluent }));
bot.use(useTemplates);
bot.use(startMenu);
bot.use(ensembleMenu);

bot.api.setMyCommands([
  { command: "start", description: "Start the bot" },
  { command: "list", description: "List words" },
  { command: "add", description: "Add a word" },
  { command: "delete", description: "Delete a word" },
]);

bot.command("start", async (ctx) => {
  const fromId = ctx.from!.id;
  let user = await getUser({ userUid: fromId });
  if (!user) {
    user = await createUser({
      uid: fromId,
      username: ctx.from?.username,
      firstName: ctx.from!.first_name,
      lastName: ctx.from?.last_name,
    });
  }
  const joinCode = ctx.match;
  if (joinCode) {
    const ensemble = await joinEnsemble({ userId: user.id, joinCode });
    await ctx.reply(ctx.t("join_success", { ensembleName: ensemble.name }));
    return;
  }
  await ctx.reply(ctx.t("start_command_answer"), { reply_markup: startMenu });
});

bot.command("join", async (ctx) => {});

bot.command("create", async (ctx, next) => {
  await createEnsembleHandler(ctx, next);
});

bot.command("cancel", async (ctx) => {
  ctx.session.step = "idle";
  await ctx.reply(ctx.t("operation_cancelled"));
});

bot.on("message:entities:bot_command", async (ctx, next) => {
  const commandText = getCommandFromMessage(ctx.msg)!;
  const command = analizeCommand(commandText);

  if (!command?.id) {
    return;
  }

  switch (command?.type) {
    case "ensemble":
      const ensemble = await getEnsemble({ ensembleId: command?.id });
      if (!ensemble) {
        ctx.reply("Agrupación no encontrada");
        break;
      }
      printEnsembleHandler(ensemble)(ctx, next);
      break;
  }
});

const router = new Router<MyContext>((ctx) => ctx.session.step);

router.route("create_ensemble_name", async (ctx, next) => {
  const ensembleName = ctx.msg?.text;
  if (!ensembleName) return;
  const userId = await getUserIdFromUID({ userUid: ctx.from!.id });
  if (!userId) return;
  const ensemble = await createEnsemble({
    userId,
    name: ensembleName,
    joinCodeEnabled: true,
  });
  await printEnsembleHandler(ensemble)(ctx, next);
  ctx.session.step = "idle";
});

bot.use(router);
bot.start();
