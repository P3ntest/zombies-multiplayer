import { tmx } from "tmx-map-parser";
import { parseTiledMap } from "./tiledParser";
// The *.tmx file can be loaded as a string or URL encoded data.
// for Webpack use 'url-loader' plugin, for Rollup it can be '@rollup/plugin-url'

const file = await Bun.file("./maps/Test map.tmx").text();

const data = await parseTiledMap(file);

await Bun.write("./maps/Test map.json", JSON.stringify(data, null, 2));
