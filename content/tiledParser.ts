import { parseXml } from "@rgrove/parse-xml";

export function parseTiledMap(xml: string) {
  const parsed = parseXml(xml);

  return parsed;
}
