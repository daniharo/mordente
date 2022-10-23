import pug from "pug";
import { TranslateFunction } from "@grammyjs/fluent";
import {
  Admin,
  Ensemble,
  Membership,
  User,
  Event,
  EventAssignedUser,
  Song,
} from "@prisma/client";

type DefaultTemplateParameter = Parameters<
  ReturnType<typeof pug.compileFile>
>[0];

function getPath(templateName: string) {
  if (process.env.NODE_ENV === "production") {
    return `${__dirname}/../../src/templates/${templateName}.pug`;
  }
  return `${__dirname}/../templates/${templateName}.pug`;
}

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
  getPath("ensemble-detail")
);

interface EnsembleMembersProps {
  ensembleName: string;
  members: (Membership & { user: User })[];
}
export const ensembleMembersTemplate = compileFile<EnsembleMembersProps>(
  getPath("ensemble-members")
);

interface MembershipDetailProps {
  membership: Membership & { user: User; ensemble: Ensemble };
}
export const membershipDetailTemplate = compileFile<MembershipDetailProps>(
  getPath("membership-detail")
);

interface MyMembershipsProps {
  memberships: (Membership & { admin: Admin | null; ensemble: Ensemble })[];
}
export const myMembershipsTemplate = compileFile<MyMembershipsProps>(
  getPath("my-memberships")
);

interface EventsSummaryProps {
  currentEvents: Event[];
  futureEvents: Event[];
}
export const eventsSummaryTemplate = compileFile<EventsSummaryProps>(
  getPath("events-summary")
);

interface EventDetailProps {
  event: Event;
}
export const eventDetailTemplate = compileFile<EventDetailProps>(
  getPath("event-detail")
);

interface EventAssignationProps {
  assignations: (EventAssignedUser & { user: User })[];
}
export const eventAssignationsTemplate = compileFile<EventAssignationProps>(
  getPath("event-attendances")
);

interface SongListProps {
  songs: Song[];
}
export const songListTemplate = compileFile<SongListProps>(
  getPath("song-list")
);
