import { Bot, session } from "grammy";
import dotenv from "dotenv";
import { useFluent } from "@grammyjs/fluent";
import fluent from "./locales/fluent";
import { MyContext, SessionData } from "./context";
import { useTemplates } from "./middleware/templates";
import { startMenu } from "./menus/startMenu";
import { createUser, getUser, getUserIdFromUID } from "./utils/models/user";
import { joinEnsemble } from "./utils/models/membership";
import { createEnsemble, getEnsembleName } from "./utils/models/ensemble";
import { analizeCommand, getCommandFromMessage } from "./utils/commandHandler";
import { Router } from "@grammyjs/router";
import { createEnsembleHandler } from "./handlers/ensemble";

dotenv.config();

function createInitialSessionData(): SessionData {
  return { step: "idle" };
}

const bot = new Bot<MyContext>(process.env.BOT_TOKEN ?? "");
bot.use(session({ initial: createInitialSessionData }));
bot.use(useFluent({ fluent }));
bot.use(useTemplates);
bot.use(startMenu);

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
  const ensembleId = Number(ctx.match);
  if (Number.isInteger(ensembleId) && ensembleId > 0) {
    await joinEnsemble({ userId: user.id, ensembleId });
    const ensembleName = await getEnsembleName({ ensembleId });
    await ctx.reply(ctx.t("join_success", { ensembleName: ensembleName! }));
    return;
  }
  await ctx.reply(ctx.t("start_command_answer"), { reply_markup: startMenu });
});

bot.command("join", async (ctx) => {
  await ctx.reply(ctx.t("join_command_answer"));
});

bot.command("create", async (ctx, next) => {
  await createEnsembleHandler(ctx, next);
});

bot.command("cancel", async (ctx) => {
  ctx.session.step = "idle";
  await ctx.reply(ctx.t("operation_cancelled"));
});

bot.on("message:entities:bot_command", (ctx) => {
  const commandText = getCommandFromMessage(ctx.msg)!;
  const command = analizeCommand(commandText);

  console.log(`Command received: ${commandText}`);
  console.log("Command object:", command);
});

const router = new Router<MyContext>((ctx) => ctx.session.step);

router.route("create_ensemble_name", async (ctx) => {
  const ensembleName = ctx.msg?.text;
  if (!ensembleName) return;
  const userId = await getUserIdFromUID({ userUid: ctx.from!.id });
  if (!userId) return;
  const ensemble = await createEnsemble({
    userId,
    name: ensembleName,
    joinCodeEnabled: true,
  });
  await ctx.reply(ctx.templates.ensembleDetailTemplate({ ensemble }), {
    parse_mode: "HTML",
  });
  ctx.session.step = "idle";
});

bot.use(router);
bot.start();
