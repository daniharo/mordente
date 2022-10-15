import { CronJob } from "cron";
import { getAllAssignationsForTime } from "../models/eventAssignation";
import { Event } from "@prisma/client";
import { bot } from "../app";

const remindEvents = async () => {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start.getTime());
  end.setUTCHours(23, 59, 59, 999);

  const assignations = await getAllAssignationsForTime(start, end);
  const groups = new Map<number, Event[]>();
  for (const assignation of assignations) {
    const user = groups.get(assignation.user.uid);
    if (user) {
      user.push(assignation.event);
    } else {
      groups.set(assignation.user.uid, [assignation.event]);
    }
  }

  const promises = [...groups].map((group) => {
    const telegramUserId = group[0];
    const events = group[1];
    return bot.api.sendMessage(
      telegramUserId,
      `Recuerda que hoy tienes estos eventos: \n${events
        .map((event) => event.name)
        .join("\n")}`
    );
  });
  return Promise.allSettled(promises);
};

const remind = () => {
  remindEvents()
    .then((messages) => {
      const lines = [];
      for (const message of messages) {
        if (message.status === "rejected") {
          lines.push(message.reason);
        }
      }
      console.error(`Errors sending messages:\n${lines.join("\n")}`);
    })
    .catch((e) => console.error(e));
};

export const reminderCronJob = new CronJob("0 0 8 * * *", remind, null, false);
