import { MyContext } from "../context";
import {
  deleteMembership,
  getMembership,
  joinEnsemble,
  userIsMember,
} from "../models/membership";
import { printEnsembleHandler } from "./ensemble";
import { Membership } from "@prisma/client";
import { membershipMenu } from "../menus/membershipMenu";
import { isAdmin } from "../models/admin";
import { formatDate } from "../utils/dateUtils";
import { notifyJoin } from "../notifications/notifyJoin";

export const joinEnsembleHandler =
  (joinCode: string) => async (ctx: MyContext) => {
    const membership = await joinEnsemble({ userId: ctx.userId, joinCode });
    if (membership) {
      await ctx.reply(
        ctx.t("join_success", { ensembleName: membership.ensemble.name })
      );
      await printEnsembleHandler(membership.ensemble)(ctx);
      await notifyJoin(membership);
    } else {
      await ctx.reply(ctx.t("join_error"));
    }
    return;
  };

export const printMembershipHandler =
  (membershipId: Membership["id"]) => async (ctx: MyContext) => {
    const membership = await getMembership(membershipId);
    if (!membership) {
      await ctx.reply("Inscripción no encontrada");
      return;
    }
    if (
      !(await userIsMember({
        userId: ctx.userId,
        ensembleId: membership.ensembleId,
      }))
    ) {
      await ctx.reply("No eres participante en esta agrupación.");
      return;
    }
    const text = ctx.templates.membershipDetailTemplate({
      membership,
      creationDateString: formatDate(membership.creationDate),
    });
    ctx.session.membershipId = membershipId;
    await ctx.reply(text, { parse_mode: "HTML", reply_markup: membershipMenu });
  };

export const deleteMembershipHandler =
  (membershipId: Membership["id"]) => async (ctx: MyContext) => {
    const membership = await getMembership(membershipId);
    if (!membership) {
      await ctx.reply("Inscripción no encontrada");
      return;
    }
    if (
      membership.userId !== ctx.userId &&
      !(await isAdmin({
        userId: ctx.userId,
        ensembleId: membership.ensembleId,
      }))
    ) {
      await ctx.reply("No tienes permisos para eliminar esta inscripción.");
      return;
    }
    await deleteMembership(membershipId);
    await ctx.reply("Inscripción eliminada con éxito.");
  };
