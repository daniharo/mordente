import { Fluent } from "@moebius/fluent";

const fluent = new Fluent();

(async () => {
  await fluent.addTranslation({
    locales: "es",
    filePath: [`${__dirname}/es.ftl`],
  });
})().catch((reason) => console.error("Couldn't load translations", reason));

export default fluent;
