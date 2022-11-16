import { Composer } from "grammy";
import { MyContext } from "../context";
import { Menu } from "@grammyjs/menu";
import { isAdmin } from "../models/admin";
import {
  getDateTime,
  getMandatoryText,
  MyConversation,
} from "../conversations/utils";
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
  EDIT_START_DATE: {
    name: "EDIT_EVENT_START_DATE",
    conversation: editEventStartDateConversation,
  },
  EDIT_END_DATE: {
    name: "EDIT_EVENT_END_DATE",
    conversation: editEventEndDateConversation,
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
      .text("Cambiar fecha/hora de inicio", (ctx) =>
        ctx.conversation.enter(CONVERSATIONS.EDIT_START_DATE.name)
      )
      .row()
      .text("Cambiar fecha/hora de fin", (ctx) =>
        ctx.conversation.enter(CONVERSATIONS.EDIT_END_DATE.name)
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

async function editEventStartDateConversation(
  conversation: MyConversation,
  ctx: MyContext
) {
  const { eventId } = ctx.session;
  if (eventId === undefined) {
    return;
  }
  await ctx.reply(
    "Escribe la nueva fecha y hora de inicio del evento en formato dd/mm/yyyy hh:mm"
  );
  const startDate = await getDateTime(conversation, ctx);
  await conversation.external(() => updateEvent(eventId, { startDate }));
  await ctx.reply(SUCCESS_MESSAGE);
}

async function editEventEndDateConversation(
  conversation: MyConversation,
  ctx: MyContext
) {
  const { eventId } = ctx.session;
  if (eventId === undefined) {
    return;
  }
  await ctx.reply(
    "Escribe la nueva fecha y hora de fin del evento en formato dd/mm/yyyy hh:mm"
  );
  const endDate = await getDateTime(conversation, ctx);
  await conversation.external(() => updateEvent(eventId, { endDate }));
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
