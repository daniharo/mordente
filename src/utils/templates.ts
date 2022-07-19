import pug from "pug";
import { TranslateFunction } from "@grammyjs/fluent";
import { Admin, Ensemble, Membership, User, Event } from "@prisma/client";

type DefaultTemplateParameter = Parameters<
  ReturnType<typeof pug.compileFile>
>[0];

function compileFile<Props extends DefaultTemplateParameter>(
  ...args: Parameters<typeof pug.compileFile>
) {
  return pug.compileFile(...args) as (
    locals: Props & {
      t: TranslateFunction;
    }
  ) => string;
}

interface EnsembleDetailProps {
  ensemble: Ensemble;
}
export const ensembleDetailTemplate = compileFile<EnsembleDetailProps>(
  __dirname + "/../templates/ensemble-detail.pug"
);

interface EnsembleMembersProps {
  ensembleName: string;
  members: (Membership & { user: User })[];
}
export const ensembleMembersTemplate = compileFile<EnsembleMembersProps>(
  __dirname + "/../templates/ensemble-members.pug"
);

interface MembershipDetailProps {
  membership: Membership & { user: User; ensemble: Ensemble };
}
export const membershipDetailTemplate = compileFile<MembershipDetailProps>(
  __dirname + "/../templates/membership-detail.pug"
);

interface MyMembershipsProps {
  memberships: (Membership & { admin: Admin | null; ensemble: Ensemble })[];
}
export const myMembershipsTemplate = compileFile<MyMembershipsProps>(
  __dirname + "/../templates/my-memberships.pug"
);

interface EventsSummaryProps {
  currentEvents: Event[];
  futureEvents: Event[];
}
export const eventsSummaryTemplate = compileFile<EventsSummaryProps>(
  __dirname + "/../templates/events-summary.pug"
);

interface EventDetailProps {
  event: Event;
}
export const eventDetailTemplate = compileFile<EventDetailProps>(
  __dirname + "/../templates/event-detail.pug"
);
