import { useEffect, useRef } from "react";
import {
  colyseusClient,
  setCurrentRoom,
  useColyseusRoom,
  useColyseusState,
} from "../../colyseus";
import {
  MyRoomState,
  PlayerState,
} from "../../../../server/src/rooms/schema/MyRoomState";
import { useCharacterCustomizationStore } from "../../components/ui/characterCusotmizationStore";
// const networkTickRate = 20;

export function useNetworkTick(callback: (tick: number) => void) {
  useRoomMessageHandler("gameTick", (message: number) => {
    callback(message);
  });
  // const callbackRef = useRef(callback);
  // callbackRef.current = callback;

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     callbackRef.current();
  //   }, 1000 / networkTickRate);
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const roomMessageHandlers = new Map<string, Set<(message: any) => void>>();

/**
 * This hook should only be mounted once.
 */
let currentListenerId = 0;
export function useBroadcastRoomMessages() {
  const room = useColyseusRoom();

  useEffect(() => {
    const listenerId = ++currentListenerId;
    room?.onMessage("*", (type, message) => {
      if (listenerId !== currentListenerId) {
        return;
      }
      const handlers = roomMessageHandlers.get(type as string) ?? new Set();
      handlers.forEach((handler) => handler(message));
    });
  }, [room]);
}

export function useRoomMessageHandler(
  type: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (message: any) => void
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const existingHandlers = roomMessageHandlers.get(type) ?? new Set();
    const callback = (message: unknown) => {
      callbackRef.current(message);
    };
    existingHandlers.add(callback);
    roomMessageHandlers.set(type, existingHandlers);

    return () => {
      const existingHandlers = roomMessageHandlers.get(type) ?? new Set();
      existingHandlers.delete(callback);
      roomMessageHandlers.set(type, existingHandlers);
    };
  }, [type]);
}

export function useSelf(): PlayerState {
  const sessionId = useColyseusRoom()?.sessionId;
  const players = useColyseusState((s) => s.players);
  return { ...players!.get(sessionId!) } as PlayerState;
}

export function useSetQueryOrReconnectToken() {
  const room = useColyseusRoom();
  useEffect(() => {
    if (!room?.id) return;
    // the the ?roomId= query param
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("roomId", room?.id);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${urlParams}`
    );
    localStorage.setItem("reconnectToken", room?.reconnectionToken);
  }, [room?.id, room?.reconnectionToken]);
}

let connecting = false;

export function useTryJoinByQueryOrReconnectToken() {
  const room = useColyseusRoom();
  const { selectedClass, name } = useCharacterCustomizationStore();

  useEffect(() => {
    if (connecting) return;
    if (room) return;

    const roomId = new URLSearchParams(window.location.search).get("roomId");
    if (localStorage.getItem("reconnectToken")) {
      console.log("trying to reconnect");
      connecting = true;
      colyseusClient
        .reconnect<MyRoomState>(localStorage.getItem("reconnectToken")!)
        .then(setCurrentRoom)
        .then(() => {
          console.log("reconnected");
        })
        .catch(console.error)
        .finally(() => {
          connecting = false;
        });
    } else if (roomId) {
      console.log("trying to join by roomId in query", roomId);
      connecting = true;
      colyseusClient
        .joinById<MyRoomState>(roomId.toLowerCase(), {
          playerName: name,
          playerClass: selectedClass,
        })
        .then(setCurrentRoom)
        .catch(console.error)
        .finally(() => {
          connecting = false;
        });
    }
  }, [room]);
}
