import { AccountSessionData } from "../middleware/useAccount";
import { Ensemble, Event, Membership } from "@prisma/client";
import { CREATE_EVENT_STEPS } from "../composers/createEvent";
import { ValueOf } from "../utilityTypes";
import { CalendarOptions } from "grammy-calendar";

export interface SessionData extends AccountSessionData {
  step: "idle" | "create_ensemble_name" | ValueOf<typeof CREATE_EVENT_STEPS>;
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
}

export const createInitialSessionData: () => SessionData = () => {
  return {
    step: "idle",
    createEvent: {},
    calendarOptions: {},
  };
};
