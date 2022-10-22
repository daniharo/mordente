import { Fluent } from "@moebius/fluent";

const fluent = new Fluent();

const prefixDir =
  process.env.NODE_ENV === "production"
    ? `${__dirname}/../../src/locales`
    : __dirname;

(async () => {
  await fluent.addTranslation({
    locales: "es",
    filePath: [`${prefixDir}/es.ftl`],
  });
})().catch((reason) => console.error("Couldn't load translations", reason));

export default fluent;
