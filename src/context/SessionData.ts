import { Ensemble, Event, Membership } from "@prisma/client";
import { CalendarOptions } from "grammy-calendar";

export type SessionData = {
  ensembleId?: Ensemble["id"];
  membershipId?: Membership["id"];
  eventId?: Event["id"];
  createEvent: {
    name?: string;
    startDate?: Date;
    endDate?: Date;
    eventType?: string;
    description?: string;
  };
  calendarOptions: CalendarOptions;
  eventAssignationPage: number;
};

export const createInitialSessionData: () => SessionData = () => {
  return {
    createEvent: {},
    calendarOptions: {},
    eventAssignationPage: 0,
  };
};
