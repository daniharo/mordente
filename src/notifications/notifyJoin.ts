import { Ensemble, Membership, User } from "@prisma/client";
import { getAdminsWithUsers } from "../models/admin";
import { bot } from "../app";

export const notifyJoin = async (
  membership: Membership & { user: User; ensemble: Ensemble }
) => {
  const admins = await getAdminsWithUsers(membership.ensembleId);
  const promises = admins.map((admin) => {
    let text = `🎉 *${membership.user.firstName}* `;
    if (membership.user.lastName) text += `*${membership.user.lastName}*`;
    text += ` se acaba de unir a la agrupación *${membership.ensemble.name}*\\.`;
    return bot.api.sendMessage(admin.user.uid, text, {
      parse_mode: "MarkdownV2",
    });
  });
  console.log({ admins, promises });
  return Promise.allSettled(promises);
};
