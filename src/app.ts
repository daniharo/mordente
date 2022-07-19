import { Bot, session } from "grammy";
import dotenv from "dotenv";
import { useFluent } from "@grammyjs/fluent";
import fluent from "./locales/fluent";
import { MyContext } from "./context";
import { useTemplates } from "./middleware/useTemplates";
import { startMenu } from "./menus/startMenu";
import { createEnsemble } from "./models/ensemble";
import { Router } from "@grammyjs/router";
import {
  createEnsembleHandler,
  printEnsembleHandler,
} from "./handlers/ensemble";
import { ensembleMenu } from "./menus/ensembleMenu";
import { useAccount } from "./middleware/useAccount";
import { joinEnsembleHandler } from "./handlers/membership";
import { membershipMenu } from "./menus/membershipMenu";
import { getMembershipsForUser } from "./models/membership";
import { createInitialSessionData } from "./context/SessionData";
import { useCreateEvent } from "./composers/createEvent";
import { calendarMenu } from "./menus/calendarMenu";
import { useMordenteCommand } from "./middleware/useMordenteCommand";

dotenv.config();

const bot = new Bot<MyContext>(process.env.BOT_TOKEN ?? "");
bot.use(session({ initial: createInitialSessionData }));
bot.use(useFluent({ fluent }));
bot.use(useTemplates);
bot.use(useAccount);
bot.use(startMenu);
bot.use(calendarMenu);
bot.use(ensembleMenu);
bot.use(membershipMenu);
bot.use(useCreateEvent);

bot.api.setMyCommands([
  { command: "start", description: "Iniciar el bot" },
  { command: "my_list", description: "Ver mis agrupaciones" },
  { command: "create", description: "Crear una agrupación" },
  { command: "join", description: "Unirme a una agrupación" },
  { command: "cancel", description: "Cancelar operación" },
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
  await ctx.reply(ctx.t("join_how"));
});

bot.command("create", async (ctx) => {
  await createEnsembleHandler(ctx);
});

bot.command("cancel", async (ctx) => {
  ctx.session.step = "idle";
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
