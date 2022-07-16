import pug from "pug";
import { TranslateFunction } from "@grammyjs/fluent";
import { Ensemble, Membership } from "@prisma/client";

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
  members: Membership[];
}
export const ensembleMembersTemplate = compileFile<EnsembleMembersProps>(
  __dirname + "/../templates/ensemble-members.pug"
);
