import { Composer } from "grammy";
import { joinEnsembleHandler } from "../handlers/membership";
import { startMenu } from "../menus/startMenu";
import { createEnsembleHandler } from "../handlers/ensemble";
import { getMembershipsForUser } from "../models/membership";
import { useMordenteCommand } from "../middleware/useMordenteCommand";
import { MyContext } from "../context";

export const useCommand = new Composer<MyContext>();

useCommand.command("start", async (ctx) => {
  const joinCode = ctx.match;
  if (joinCode) {
    await joinEnsembleHandler(joinCode)(ctx);
    return;
  }
  await ctx.reply(ctx.t("start_command_answer"), { reply_markup: startMenu });
});

useCommand.command("join", async (ctx) => {
  await ctx.reply(ctx.t("join_how"));
});

useCommand.command("create", async (ctx) => {
  await createEnsembleHandler(ctx);
});

useCommand.command("cancel", async (ctx) => {
  ctx.session.step = "idle";
  await ctx.conversation.exit();
  await ctx.reply(ctx.t("operation_cancelled"));
});

useCommand.command("my_list", async (ctx) => {
  const myMemberships = await getMembershipsForUser(ctx.userId);
  await ctx.reply(
    ctx.templates.myMembershipsTemplate({ memberships: myMemberships }),
    {
      parse_mode: "HTML",
    }
  );
});

useCommand.use(useMordenteCommand);