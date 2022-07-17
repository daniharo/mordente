import { Menu } from "@grammyjs/menu";
import { MyContext } from "../context";
import { isAdmin } from "../utils/models/admin";
import { getMembership } from "../utils/models/membership";
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
    if (admin || membership.userId === ctx.userId) {
      range
        .text("Eliminar", async (ctx) => {
          await deleteMembershipHandler(membershipId)(ctx);
        })
        .row();
    }
  }
);
