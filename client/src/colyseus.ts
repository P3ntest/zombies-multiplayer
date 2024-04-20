import { MyRoomState } from "../../server/src/rooms/schema/MyRoomState";
import { colyseus } from "use-colyseus";

const productionWebsocketUrl = window.location.origin.replace(/^http/, "ws");
const websocketUrl =
  process.env.NODE_ENV !== "production"
    ? "ws://localhost:2567"
    : productionWebsocketUrl;

const {
  client,
  connectToColyseus,
  disconnectFromColyseus,
  useColyseusRoom,
  useColyseusState,
} = colyseus<MyRoomState>(websocketUrl);

export {
  client as colyseusClient,
  connectToColyseus,
  disconnectFromColyseus,
  useColyseusRoom,
  useColyseusState,
};
