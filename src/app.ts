import { Bot, GrammyError, HttpError, session } from "grammy";
import dotenv from "dotenv";
import { useFluent } from "@grammyjs/fluent";
import fluent from "./locales/fluent";
import { MyContext } from "./context";
import { useTemplates } from "./middleware/useTemplates";
import { startMenu } from "./menus/startMenu";
import { Router } from "@grammyjs/router";
import { createEnsembleHandler } from "./handlers/ensemble";
import { ensembleMenu } from "./menus/ensembleMenu";
import { useAccount } from "./middleware/useAccount";
import { joinEnsembleHandler } from "./handlers/membership";
import { membershipMenu } from "./menus/membershipMenu";
import { getMembershipsForUser } from "./models/membership";
import { createInitialSessionData, SessionData } from "./context/SessionData";
import { useCreateEvent } from "./conversations/createEvent";
import { calendarMenu } from "./menus/calendarMenu";
import { useMordenteCommand } from "./middleware/useMordenteCommand";
import { eventMenu } from "./menus/eventMenu";
import { PrismaAdapter } from "@grammyjs/storage-prisma";
import prisma from "./prisma/PrismaClient";
import { conversations } from "@grammyjs/conversations";
import { useCreateEnsemble } from "./conversations/createEnsemble";

dotenv.config();

const bot = new Bot<MyContext>(process.env.BOT_TOKEN ?? "");
bot.use(
  session({
    initial: createInitialSessionData,
    storage: new PrismaAdapter<SessionData>(prisma.session),
  })
);
bot.use(useFluent({ fluent }));
bot.use(useTemplates);
bot.use(useAccount);
bot.use(conversations());
bot.use(startMenu);
bot.use(calendarMenu);
bot.use(eventMenu);
bot.use(ensembleMenu);
bot.use(membershipMenu);
bot.use(useCreateEvent);
bot.use(useCreateEnsemble);

bot.api
  .setMyCommands([
    { command: "start", description: "Iniciar el bot" },
    { command: "my_list", description: "Ver mis agrupaciones" },
    { command: "create", description: "Crear una agrupación" },
    { command: "join", description: "Unirme a una agrupación" },
    { command: "cancel", description: "Cancelar operación" },
  ])
  .catch((reason) => console.error("Couldn't set commands", reason));

bot.command("start", async (ctx) => {
  const joinCode = ctx.match;
  if (joinCode) {
    await joinEnsembleHandler(joinCode)(ctx);
    return;
  }
  await ctx.reply(ctx.t("start_command_answer"), { reply_markup: startMenu });
});

bot.command("join", async (ctx) => {
  await ctx.reply(ctx.t("join_how"));
});

bot.command("create", async (ctx) => {
  await createEnsembleHandler(ctx);
});

bot.command("cancel", async (ctx) => {
  ctx.session.step = "idle";
  await ctx.conversation.exit();
  await ctx.reply(ctx.t("operation_cancelled"));
});

bot.command("my_list", async (ctx) => {
  const myMemberships = await getMembershipsForUser(ctx.userId);
  await ctx.reply(
    ctx.templates.myMembershipsTemplate({ memberships: myMemberships }),
    {
      parse_mode: "HTML",
    }
  );
});

bot.use(useMordenteCommand);

bot.catch(async (err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
    await ctx.reply("There was an error handling your message :(");
  }
});

const router = new Router<MyContext>((ctx) => ctx.session.step);

bot.use(router);
bot
  .start()
  .then(() => console.log("Bot started!"))
  .catch((reason) => console.error("Couldn't start the bot", reason));
