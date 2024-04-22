/* eslint-disable @typescript-eslint/no-explicit-any */
import { MyRoomState } from "../../../../server/src/rooms/schema/MyRoomState";
import { colyseusClient, setCurrentRoom } from "../../colyseus";
import { useCharacterCustomizationStore } from "../../components/ui/characterCusotmizationStore";

let connecting = false;

export function useRoomMethods() {
  const playerOptions = useCharacterCustomizationStore();
  const roomOptsBase = {
    playerClass: playerOptions.selectedClass,
  };

  return {
    async createRoom(opts: any) {
      if (connecting) {
        return;
      }
      connecting = true;
      const room = await colyseusClient.create<MyRoomState>("my_room", {
        ...roomOptsBase,
        ...opts,
      });
      setCurrentRoom(room);
    },
    async quickPlay() {
      if (connecting) {
        return;
      }
      connecting = true;
      const room = await colyseusClient.joinOrCreate<MyRoomState>("my_room", {
        ...roomOptsBase,
      });
      setCurrentRoom(room);
    },
    async singlePlayer() {
      if (connecting) {
        return;
      }
      connecting = true;
      const room = await colyseusClient.create<MyRoomState>("my_room", {
        ...roomOptsBase,
        singlePlayer: true,
      });
      setCurrentRoom(room);
    },
  };
}
