import { compressJpg, compressPng } from "@assetpack/plugin-compress";
import { pixiManifest } from "@assetpack/plugin-manifest";

export default {
  entry: "./assets",
  output: "./public/assets",
  plugins: {
    compressJpg: compressJpg(),
    compressPng: compressPng(),
    manifest: pixiManifest(),
  },
};
