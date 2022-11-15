import { Event, EventAssignedUser, User } from "@prisma/client";
import { getAdminsWithUsers } from "../models/admin";
import { bot } from "../app";
import { getEnsembleId } from "../models/event";

export const notifyAttendance = async (
  assignation: EventAssignedUser & { user: User; event: Event }
) => {
  const eventId = assignation.eventId;
  const ensembleId = await getEnsembleId(eventId);
  if (ensembleId === undefined) return;
  const admins = await getAdminsWithUsers(ensembleId);
  const promises = admins.map((admin) => {
    if (admin.userId === assignation.userId) return;
    let text = `Nueva respuesta: el miembro ${assignation.user.firstName} `;
    if (assignation.user.lastName) text += `${assignation.user.lastName} `;
    switch (assignation.attendance) {
      case "YES":
        text += "asistirá ✅";
        break;
      case "NO":
        text += "no asistirá ❌";
        break;
      default:
        text += "no sabe si asistirá";
    }
    text += ` al evento "${assignation.event.name}".`;
    return bot.api.sendMessage(admin.user.uid, text);
  });
  return Promise.allSettled(promises);
};
