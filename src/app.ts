import { Bot, GrammyError, HttpError, session } from "grammy";
import dotenv from "dotenv";
import { useFluent } from "@grammyjs/fluent";
import fluent from "./locales/fluent";
import { MyContext } from "./context";
import { useTemplates } from "./middleware/useTemplates";
import { startMenu } from "./menus/startMenu";
import { useEnsembleMenu } from "./menus/ensembleMenu";
import { useAccount } from "./middleware/useAccount";
import { membershipMenu } from "./menus/membershipMenu";
import { createInitialSessionData, SessionData } from "./context/SessionData";
import { useCreateEvent } from "./conversations/createEvent";
import { calendarMenu } from "./menus/calendarMenu";
import { eventMenu } from "./menus/eventMenu";
import { PrismaAdapter } from "@grammyjs/storage-prisma";
import prisma from "./prisma/PrismaClient";
import { conversations, createConversation } from "@grammyjs/conversations";
import { useCreateEnsemble } from "./conversations/createEnsemble";
import { useAttendanceConversation } from "./conversations/attendance";
import { reminderCronJob } from "./reminders/cron";
import { useCommand } from "./composers/useCommand";
import { eventAssignationMenu } from "./menus/eventAssignationMenu";
import { hydrateFiles } from "@grammyjs/files";
import { createSongConversation } from "./conversations/createSong";
import { songListMenu } from "./menus/songListMenu";
import { songMenu } from "./menus/songMenu";
import { useEditEnsemble } from "./composers/useEditEnsemble";
import { later } from "./utils/otherUtils";

dotenv.config();

export const bot = new Bot<MyContext>(process.env.BOT_TOKEN ?? "");
bot.api.config.use(hydrateFiles(bot.token));
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
bot.command("cancel", async (ctx) => {
  await ctx.conversation.exit();
  await ctx.reply(ctx.t("operation_cancelled"));
});
bot.use(useAttendanceConversation);
bot.use(createConversation(createSongConversation));
bot.use(songListMenu);
bot.use(songMenu);
bot.use(membershipMenu);
bot.use(useEditEnsemble);
bot.use(useEnsembleMenu);
bot.use(useCreateEnsemble);
bot.use(eventAssignationMenu);
bot.use(eventMenu);
bot.use(useCreateEvent);
bot.use(startMenu);
bot.use(calendarMenu);

bot.api
  .setMyCommands([
    { command: "start", description: "Iniciar el bot" },
    { command: "about", description: "Información sobre el bot" },
    { command: "my_list", description: "Ver mis agrupaciones" },
    { command: "create", description: "Crear una agrupación" },
    { command: "join", description: "Unirme a una agrupación" },
    { command: "cancel", description: "Cancelar operación" },
    { command: "support", description: "Obtener soporte técnico" },
  ])
  .catch((reason) => console.error("Couldn't set commands", reason));

bot.use(useCommand);

bot.use(async (ctx) => {
  await ctx.reply("😬");
  await later(1000);
  await ctx.reply(ctx.t("unknown_message_1"));
  await later(1000);
  await ctx.reply(ctx.t("unknown_message_2"));
});

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
    await ctx.reply("Ha habido un error gestionando tu mensaje :(");
  }
});

bot
  .start()
  .then(() => console.log("Bot started!"))
  .catch((reason) => console.error("Couldn't start the bot", reason));

reminderCronJob.start();
