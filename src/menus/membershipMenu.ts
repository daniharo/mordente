import { Menu } from "@grammyjs/menu";
import { MyContext } from "../context";
import {
  deleteAdmin,
  getAdminsCount,
  isAdmin,
  makeAdmin,
} from "../models/admin";
import { getMembership } from "../models/membership";
import { deleteMembershipHandler } from "../handlers/membership";

export const membershipMenu = new Menu<MyContext>("membershipMenu").dynamic(
  async (ctx, range) => {
    const { membershipId } = ctx.session;
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
    if (admin) {
      const userIsAdmin = await isAdmin(membership);
      if (userIsAdmin) {
        const adminsCount = await getAdminsCount(membership.ensembleId);
        if (adminsCount > 1) {
          range.text("Quitar de admin", async (ctx) => {
            await deleteAdmin(membership.userId, membership.ensembleId);
            ctx.menu.update();
          });
        }
      } else {
        range.text("Hacer admin", async (ctx) => {
          await makeAdmin(membership.userId, membership.ensembleId);
          ctx.menu.update();
        });
      }
      range.row();
    }
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
