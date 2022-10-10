import { Menu } from "@grammyjs/menu";
import { MyContext } from "../context";
import { deleteEvent, getEvent, updateEventStatus } from "../models/event";
import { userIsMember } from "../models/membership";
import { isAdmin } from "../models/admin";

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
