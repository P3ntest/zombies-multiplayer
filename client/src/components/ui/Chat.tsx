import { useCallback, useEffect, useRef, useState } from "react";
import { useUIStore } from "./uiStore";
import { twMerge } from "tailwind-merge";
import { useColyseusRoom } from "../../colyseus";
import { useRoomMessageHandler } from "../../lib/networking/hooks";

export function Chat() {
  const [messages, setMessages] = useState<
    {
      content: string;
      time: Date;
      color?: string;
    }[]
  >([]);
  const { chatOpen, setChatOpen } = useUIStore();
  const room = useColyseusRoom();

  useRoomMessageHandler("chatMessage", (message) => {
    setMessages((messages) => [
      ...messages,
      {
        content: message.message,
        time: new Date(),
        color: message.color,
      },
    ]);
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setChatOpen(false);
    inputRef.current?.blur();
    inputRef.current && (inputRef.current.value = "");
  }, [setChatOpen]);

  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (chatOpen) {
          if (inputRef.current?.value)
            room?.send("chatMessage", inputRef.current.value);
          close();
        } else {
          setChatOpen(true);
          inputRef.current?.focus();
        }
      } else if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("keydown", keydown);
    };
  }, [chatOpen, setChatOpen, close]);

  return (
    <div className="fixed bottom-0 left-0">
      <div className="flex flex-col w-96 gap-1 p-1">
        {messages
          .filter((m) => {
            if (chatOpen) return true;
            return m.time.getTime() > Date.now() - 5000;
          })
          .map((message, i) => (
            <div
              key={i}
              className={twMerge(
                "bg-slate-800 bg-opacity-80 p-1 px-2 rounded-lg text-white text-md",
                !chatOpen && "bg-opacity-50"
              )}
              style={{
                color: message.color,
              }}
            >
              {message.content}
            </div>
          ))}
        <input
          ref={inputRef}
          className={twMerge(
            "bg-slate-800 p-1 px-2 rounded-lg text-white text-md",
            !chatOpen && "opacity-0 pointer-events-none h-0"
          )}
          placeholder="Type a message..."
        />
      </div>
    </div>
  );
}
