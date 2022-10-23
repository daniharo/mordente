import { Composer } from "grammy";
import { MyContext } from "../../context";
import { analizeCommand, getCommandFromMessage } from "./commandHelper";
import { getEnsemble } from "../../models/ensemble";
import { printEnsembleHandler } from "../../handlers/ensemble";
import { printMembershipHandler } from "../../handlers/membership";
import { printEventHandler } from "../../handlers/event";
import { printSongHandler } from "../../handlers/song";

const commandComposer = new Composer<MyContext>();

commandComposer.on("message:entities:bot_command", async (ctx, next) => {
  const commandText = getCommandFromMessage(ctx.msg);
  if (!commandText) {
    await next();
    return;
  }
  const command = analizeCommand(commandText);

  if (!command?.id) {
    await next();
    return;
  }

  switch (command?.type) {
    case "ensemble": {
      const ensemble = await getEnsemble({ ensembleId: command?.id });
      if (!ensemble) {
        await ctx.reply("Agrupación no encontrada");
        break;
      }
      await printEnsembleHandler(ensemble)(ctx);
      break;
    }
    case "membership":
      if (!command.id) {
        await ctx.reply("Comando no válido.");
        return;
      }
      await printMembershipHandler(command.id)(ctx);
      break;
    case "event":
      if (!command.id) {
        await ctx.reply("Comando no válido.");
        return;
      }
      await printEventHandler(command.id)(ctx);
      break;
    case "song":
      if (!command.id) {
        await ctx.reply("Comando no válido.");
        return;
      }
      await printSongHandler(command.id)(ctx);
      break;
  }
});

export const useMordenteCommand = commandComposer.middleware();
