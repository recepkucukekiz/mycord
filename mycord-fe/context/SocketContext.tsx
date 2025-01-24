import { toast } from "@/hooks/use-toast";
import { Message, MessageNotification } from "@/interfaces/app";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setOnlineUsers, setSocketLatency, setUserId } from "@/store/state";
import React, { createContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL;

interface SocketContextType {
  socket: Socket | null;
}

export const SocketContext = createContext<SocketContextType | undefined>(
  undefined
);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.app.user);
  const rtcUserId = useAppSelector((state) => state.app.rtcUserId);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current?.on("connected", (data: { id: string }) => {
      console.log("connected", data);
      dispatch(setUserId(data));
    });

    const pingInterval = setInterval(() => {
      socketRef.current?.emit("ping");
    }, 5000);

    socketRef.current.on("pong", (serverTime) => {
      const endTime = Date.now();
      const pingTime = Math.abs(endTime - serverTime);
      dispatch(setSocketLatency(pingTime));
    });

    socketRef.current.on("RTCuser-list", (data: any) => {
      dispatch(setOnlineUsers(data));
    });

    socketRef.current.on(
      "new-message-notification",
      (data: MessageNotification) => {
        toast({
          title: `${data.user?.name} says on #${data.channel?.name}-${data.server?.name}`,
          description: `${data.content}`,
        });
      }
    );

    return () => {
      clearInterval(pingInterval);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (socketRef.current && user && rtcUserId) {
      socketRef.current.emit("RTClogin", { id: rtcUserId, user });
    }
  }, [rtcUserId, user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};
