import { Menu } from "@grammyjs/menu";
import { MyContext } from "../context";
import { getMembersForEvent } from "../models/membership";
import { assignMember, unassignMember } from "../models/eventAssignation";

const MEMBERS_PER_PAGE = 10;

export const eventAssignationMenu = new Menu<MyContext>(
  "eventAssignation"
).dynamic(async (ctx, range) => {
  const { ensembleId, eventId, eventAssignationPage: page } = ctx.session;
  if (ensembleId === undefined || eventId === undefined) {
    return;
  }
  const memberships = await getMembersForEvent(ensembleId, eventId);
  const totalPages = Math.ceil(memberships.length / MEMBERS_PER_PAGE);
  const start = page * MEMBERS_PER_PAGE;
  const currentMemberships = memberships.slice(start, start + MEMBERS_PER_PAGE);

  for (const membership of currentMemberships) {
    let fullName = membership.user.firstName;
    if (membership.user.lastName) {
      fullName += membership.user.lastName;
    }
    const assigned = membership.user.assignedEvents.length > 0;
    const assignedString = assigned ? "✅ " : "";
    range
      .text(`${assignedString}${fullName}`, async (ctx) => {
        if (assigned) {
          await unassignMember(eventId, membership.user.id);
        } else {
          await assignMember(eventId, membership.user.id);
        }
        ctx.menu.update();
      })
      .row();
  }

  const isFirst = page === 0;
  const isLast = page === totalPages - 1;
  range
    .text(!isFirst ? "« 1" : "", (ctx) => {
      if (isFirst) return;
      ctx.session.eventAssignationPage = 0;
      ctx.menu.update();
    })
    .text(!isFirst ? `‹ ${page}` : "", (ctx) => {
      if (isFirst) return;
      ctx.session.eventAssignationPage = page - 1;
      ctx.menu.update();
    })
    .text(`· ${page + 1} ·`)
    .text(!isLast ? `${page + 2} ›` : "", (ctx) => {
      if (isLast) return;
      ctx.session.eventAssignationPage = page + 1;
      ctx.menu.update();
    })
    .text(!isLast ? `${totalPages} »` : "", (ctx) => {
      if (isLast) return;
      ctx.session.eventAssignationPage = totalPages - 1;
      ctx.menu.update();
    })
    .row();
});
