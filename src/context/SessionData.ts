import { AccountSessionData } from "../middleware/accountMiddleware";
import { Ensemble, Membership } from "@prisma/client";
import { CREATE_EVENT_STEPS } from "../composers/createEvent";
import { ValueOf } from "../utilityTypes";
export interface SessionData extends AccountSessionData {
  step: "idle" | "create_ensemble_name" | ValueOf<typeof CREATE_EVENT_STEPS>;
  ensembleId?: Ensemble["id"];
  membershipId?: Membership["id"];
  createEvent: {
    name?: string;
    startDate?: Date;
    endDate?: Date;
    eventType?: string;
    description?: string;
  };
}

export const createInitialSessionData: () => SessionData = () => {
  return { step: "idle", userId: undefined, createEvent: {} };
};
