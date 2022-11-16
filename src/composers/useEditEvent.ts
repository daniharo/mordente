import { Composer } from "grammy";
import { MyContext } from "../context";
import { Menu } from "@grammyjs/menu";
import { isAdmin } from "../models/admin";
import { getMandatoryText, MyConversation } from "../conversations/utils";
import { createConversation } from "@grammyjs/conversations";
import { getEvent, updateEvent } from "../models/event";

const SUCCESS_MESSAGE = "Se ha actualizado el evento correctamente 🎉";

const CONVERSATIONS = {
  EDIT_NAME: {
    name: "EDIT_EVENT_NAME",
    conversation: editEventNameConversation,
  },
  EDIT_DESCRIPTION: {
    name: "EDIT_EVENT_DESCRIPTION",
    conversation: editEventDescriptionConversation,
  },
} as const;

export const useEditEvent = new Composer<MyContext>();

export const editEventMenu = new Menu<MyContext>("editEventMenu").dynamic(
  async (ctx, range) => {
    const { eventId } = ctx.session;
    if (eventId === undefined) {
      return;
    }
    const event = await getEvent(eventId);
    if (!event) {
      return;
    }
    const userIsAdmin = await isAdmin({
      userId: ctx.userId,
      ensembleId: event.ensembleId,
    });
    if (!userIsAdmin) {
      return;
    }
    range
      .text("Cambiar nombre", (ctx) =>
        ctx.conversation.enter(CONVERSATIONS.EDIT_NAME.name)
      )
      .row()
      .text("🔙 Volver", (ctx) => ctx.menu.back());
  }
);

async function editEventNameConversation(
  conversation: MyConversation,
  ctx: MyContext
) {
  const { eventId } = ctx.session;
  if (eventId === undefined) {
    return;
  }
  await ctx.reply("Escribe el nuevo nombre del evento");
  const name = await getMandatoryText(conversation);
  await conversation.external(() => updateEvent(eventId, { name }));
  await ctx.reply(SUCCESS_MESSAGE);
}

async function editEventDescriptionConversation(
  conversation: MyConversation,
  ctx: MyContext
) {
  const { eventId } = ctx.session;
  if (eventId === undefined) {
    return;
  }
  await ctx.reply("Escribe la nueva descripción del evento");
  const description = await getMandatoryText(conversation);
  await conversation.external(() => updateEvent(eventId, { description }));
  await ctx.reply(SUCCESS_MESSAGE);
}

const conversationKeys = Object.keys(
  CONVERSATIONS
) as (keyof typeof CONVERSATIONS)[];

conversationKeys.forEach((key) => {
  const { name, conversation } = CONVERSATIONS[key];
  useEditEvent.use(createConversation(conversation, name));
});

useEditEvent.use(editEventMenu);
