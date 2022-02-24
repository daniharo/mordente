import { Bot, Context, session } from "grammy";
import { I18n, I18nContext } from "@grammyjs/i18n";
import dotenv from "dotenv";
import prismaClient from "./prisma/PrismaClient";
import { wordListTemplate } from "./utils/templates.js";

dotenv.config();

interface InternationalizationContext {
  readonly i18n: I18nContext;
}

type MyContext = Context & InternationalizationContext;

const i18n = new I18n({
  defaultLanguageOnMissing: true, // implies allowMissing = true
  directory: "src/locales",
  useSession: true,
});

const bot = new Bot<MyContext>(process.env.BOT_TOKEN ?? "");
// bot.use(session());
bot.use(i18n.middleware());

bot.api.setMyCommands([
  { command: "start", description: "Start the bot" },
  { command: "list", description: "List words" },
  { command: "add", description: "Add a word" },
  { command: "delete", description: "Delete a word" },
]);

bot.command("start", (ctx) => ctx.reply(ctx.i18n.t("hey")));

bot.command("list", async (ctx) => {
  const words = await prismaClient.word.findMany({
    where: { userId: { equals: ctx.msg.from?.id } },
  });
  ctx.reply(wordListTemplate({ words }));
  /*if (words.length > 0) {
    const wordList = words.map((word) => `- ${word.word}`);
    ctx.reply("Word list:\n" + wordList.join("\n"));
  } else {
    await ctx.reply("Word list is empty.");
    ctx.reply("😬");
  }*/
});

bot.command("add", async (ctx) => {
  const word = ctx.match;
  try {
    const reply = ctx.reply(`Adding word "${word}"`, {
      reply_to_message_id: ctx.message?.message_id,
    });
    await prismaClient.word.create({
      data: { word, userId: ctx.from?.id ?? -1 },
    });
    const awaitedReply = await reply;
    ctx.api.editMessageText(
      ctx.chat.id,
      awaitedReply.message_id,
      `Created word "${word}"`
    );
    //ctx.reply(`Created word "${word}"`);
  } catch {
    ctx.reply("Sorry, something happened :(");
  }
});

bot.command("delete", async (ctx) => {
  const word = ctx.match;
  const deleted = await prismaClient.word.deleteMany({
    where: {
      AND: { word: { equals: word }, userId: { equals: ctx.from?.id } },
    },
  });
  if (deleted.count > 0) {
    ctx.reply("Deleted word: " + word);
  } else {
    ctx.reply("Word does not exist");
  }
});

bot.on("message", async (ctx) => {
  await ctx.reply("Lo siento, no sé de qué me hablas...", {
    reply_to_message_id: ctx.msg.message_id,
  });
  ctx.reply("🙄");
  console.log(ctx.message);
});

bot.start();
