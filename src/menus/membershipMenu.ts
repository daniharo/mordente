import { Menu } from "@grammyjs/menu";
import { MyContext } from "../context";
import { isAdmin } from "../models/admin";
import { getMembership } from "../models/membership";
import { deleteMembershipHandler } from "../handlers/membership";

export const membershipMenu = new Menu<MyContext>("membershipMenu").dynamic(
  async (ctx, range) => {
    const { membershipId } = ctx.session;
    console.log({ membershipId });
    if (!membershipId) {
      return;
    }
    const membership = await getMembership(membershipId);
    if (!membership) return;
    const admin = await isAdmin({
      userId: ctx.userId,
      ensembleId: membership.ensembleId,
    });
    const itsMe = membership.userId === ctx.userId;
    if (admin || itsMe) {
      range
        .text(
          itsMe ? "Eliminarme de la agrupación" : "Eliminar de la agrupación",
          async (ctx) => {
            await deleteMembershipHandler(membershipId)(ctx);
          }
        )
        .row();
    }
  }
);
