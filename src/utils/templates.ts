import pug from "pug";
import { TranslateFunction } from "@grammyjs/fluent";

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

interface WordListProps {
  words: Array<string>;
}
export const wordListTemplate = compileFile<WordListProps>(
  "../templates/word-list.pug"
);
