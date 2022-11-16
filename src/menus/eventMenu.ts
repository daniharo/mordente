import { Menu } from "@grammyjs/menu";
import { MyContext } from "../context";
import { deleteEvent, getEvent, updateEventStatus } from "../models/event";
import { userIsMember } from "../models/membership";
import { isAdmin } from "../models/admin";
import {
  getAllAttendances,
  getEventAssignation,
  upsertEventAssignationAnswer,
} from "../models/eventAssignation";
import { attendanceConversation } from "../conversations/attendance";
import { notifyAttendance } from "../notifications/notifyAttendance";
import { eventAssignationMenu } from "./eventAssignationMenu";
import { editEventMenu } from "../composers/useEditEvent";

export const eventMenu = new Menu<MyContext>("eventMenu").dynamic(
  async (ctx, range) => {
    const { eventId } = ctx.session;
    if (!eventId) {
      return;
    }
    const event = await getEvent(eventId);
    if (!event) {
      await ctx.reply("El evento no existe");
      return;
    }
    const isMember = await userIsMember({
      userId: ctx.userId,
      ensembleId: event.ensembleId,
    });
    if (!isMember) {
      await ctx.reply("No participas en esta agrupación.");
      return;
    }

    const assignation = await getEventAssignation(eventId, ctx.userId);
    if (assignation) {
      range
        .text(
          `Asistiré${assignation.attendance === "YES" ? " ✅" : ""}`,
          async (ctx) => {
            const assignation = await upsertEventAssignationAnswer(
              eventId,
              ctx.userId,
              "YES",
              undefined
            );
            await ctx.menu.update({ immediate: true });
            await notifyAttendance(assignation);
          }
        )
        .text(
          `No asistiré${assignation.attendance === "NO" ? " ✅" : ""}`,
          async (ctx) => {
            await upsertEventAssignationAnswer(
              eventId,
              ctx.userId,
              "NO",
              undefined
            );
            ctx.menu.update();
            ctx.session.eventId = eventId;
            await ctx.conversation.enter(attendanceConversation.name);
          }
        )
        .row();
    }

    const userIsAdmin = await isAdmin({
      userId: ctx.userId,
      ensembleId: event.ensembleId,
    });
    if (userIsAdmin) {
      if (event.status === "DRAFT") {
        range.text("Publicar", async (ctx) => {
          const event = await updateEventStatus(eventId, "PUBLISHED");
          await ctx.reply(`El evento "${event.name}" ha sido publicado.`);
          ctx.menu.close();
        });
      }
      range
        .text("Asignación de miembros", (ctx) => {
          ctx.session.eventId = eventId;
          ctx.session.ensembleId = event.ensembleId;
          ctx.session.eventAssignationPage = 0;
          return ctx.reply(
            "Usa este menú para asignar o deasignar miembros a este evento.",
            { reply_markup: eventAssignationMenu }
          );
        })
        .row();
      range
        .text("Asistencia prevista", async (ctx) => {
          const assignations = await getAllAttendances(eventId);
          await ctx.reply(
            ctx.templates.eventAssignationsTemplate({ assignations }),
            { parse_mode: "HTML", disable_web_page_preview: true }
          );
        })
        .row();
      range
        .text("Editar", (ctx) => ctx.menu.nav("editEventMenu"))
        .text("Eliminar", async (ctx) => {
          await ctx.reply("¿Seguro que quieres eliminar el evento?", {
            reply_markup: confirmationMenu,
          });
        })
        .row();
    }
  }
);

const confirmationMenu = new Menu<MyContext>(
  "eventDeleteConfirmationMenu"
).dynamic((ctx, range) => {
  const { eventId } = ctx.session;
  if (!eventId) {
    return;
  }
  range
    .text("Sí", async (ctx) => {
      const event = await deleteEvent(eventId);
      ctx.menu.close();
      await ctx.editMessageText(`Evento "${event.name}" eliminado.`);
    })
    .text("No", (ctx) => ctx.deleteMessage());
});

eventMenu.register(confirmationMenu);
eventMenu.register(editEventMenu);
