import { PixiComponent } from "@pixi/react";
import { AnimatedSprite } from "pixi.js";

export default PixiComponent("MyAnimatedSprite", {
  create: (props) => {
    return new AnimatedSprite(props.textures);
  },
});
