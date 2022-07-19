import { Menu } from "@grammyjs/menu";
import { MyContext } from "../context";
import { createEvent } from "../utils/models/event";

type MenuMiddleware = Parameters<Menu<MyContext>["text"]>[1];

const publishMiddleware: (publish: boolean) => MenuMiddleware =
  (publish: boolean) => async (ctx) => {
    const { name, description, eventType, startDate, endDate } =
      ctx.session.createEvent;
    if (!name) {
      return;
    }
    await createEvent({
      name,
      description,
      eventType,
      startDate,
      endDate,
      status: publish ? "PUBLISHED" : "DRAFT",
      ensemble: { connect: { id: ctx.session.ensembleId } },
    });
    ctx.menu.close();
  };

export const publishEventMenu = new Menu<MyContext>("publishEventMenu")
  .text("Sí", publishMiddleware(true))
  .text("No", publishMiddleware(false));
