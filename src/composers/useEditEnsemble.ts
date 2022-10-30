import { Composer } from "grammy";
import { MyContext } from "../context";
import { Menu } from "@grammyjs/menu";
import { isAdmin } from "../models/admin";
import { getMandatoryText, MyConversation } from "../conversations/utils";
import { createConversation } from "@grammyjs/conversations";
import { updateEnsemble } from "../models/ensemble";
import { ensembleMenu } from "../menus/ensembleMenu";

const SUCCESS_MESSAGE = "Se ha actualizado la agrupación correctamente 🎉";

const CONVERSATIONS = {
  EDIT_NAME: { name: "EDIT_NAME", conversation: editEnsembleNameConversation },
  EDIT_DESCRIPTION: {
    name: "EDIT_DESCRIPTION",
    conversation: editEnsembleDescriptionConversation,
  },
  EDIT_TYPE: { name: "EDIT_TYPE", conversation: editEnsembleTypeConversation },
} as const;

export const useEditEnsemble = new Composer<MyContext>();

export const editEnsembleMenu = new Menu<MyContext>("editEnsembleMenu").dynamic(
  async (ctx, range) => {
    const { ensembleId } = ctx.session;
    if (ensembleId === undefined) {
      return;
    }
    const userIsAdmin = await isAdmin({
      userId: ctx.userId,
      ensembleId,
    });
    if (!userIsAdmin) {
      return;
    }
    range
      .text("Cambiar nombre", (ctx) =>
        ctx.conversation.enter(CONVERSATIONS.EDIT_NAME.name)
      )
      .row()
      .text("Cambiar descripción", (ctx) =>
        ctx.conversation.enter(CONVERSATIONS.EDIT_DESCRIPTION.name)
      )
      .row()
      .text("Cambiar tipo", (ctx) =>
        ctx.conversation.enter(CONVERSATIONS.EDIT_TYPE.name)
      )
      .row()
      .text("🔙 Volver", async (ctx) =>
        ctx.editMessageReplyMarkup({
          reply_markup: await ensembleMenu(ctx)(ensembleId),
        })
      );
  }
);

async function editEnsembleNameConversation(
  conversation: MyConversation,
  ctx: MyContext
) {
  if (ctx.session.ensembleId === undefined) {
    return;
  }
  await ctx.reply("Escribe el nuevo nombre de la agrupación");
  const name = await getMandatoryText(conversation);
  await updateEnsemble(ctx.session.ensembleId, { name });
  await ctx.reply(SUCCESS_MESSAGE);
}

async function editEnsembleDescriptionConversation(
  conversation: MyConversation,
  ctx: MyContext
) {
  if (ctx.session.ensembleId === undefined) {
    return;
  }
  await ctx.reply("Escribe la nueva descripción de la agrupación");
  const description = await getMandatoryText(conversation);
  await updateEnsemble(ctx.session.ensembleId, { description });
  await ctx.reply(SUCCESS_MESSAGE);
}

async function editEnsembleTypeConversation(
  conversation: MyConversation,
  ctx: MyContext
) {
  if (ctx.session.ensembleId === undefined) {
    return;
  }
  await ctx.reply("Escribe el nuevo tipo de la agrupación");
  const type = await getMandatoryText(conversation);
  await updateEnsemble(ctx.session.ensembleId, { type });
  await ctx.reply(SUCCESS_MESSAGE);
}

const conversationKeys = Object.keys(
  CONVERSATIONS
) as (keyof typeof CONVERSATIONS)[];

conversationKeys.forEach((key) => {
  const { name, conversation } = CONVERSATIONS[key];
  useEditEnsemble.use(createConversation(conversation, name));
});

useEditEnsemble.use(editEnsembleMenu);
