"use client";

import { useToast } from "@/hooks/use-toast";
import { Message } from "@/interfaces/app";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addNewMessage,
  removeFromSocketEventQueue,
  setOnlineUsers,
  setSocketLatency,
  setUserId,
} from "@/store/state";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function SocketProvider() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const dispatch = useAppDispatch();
  const socketEventQueue = useAppSelector(
    (state) => state.app.socketEventQueue
  );
  const user = useAppSelector((state) => state.app.user);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      console.log("no user found so no socket");
      return;
    }
    console.log("creating new socket");
    const socket = io(process.env.NEXT_PUBLIC_API_URL);
    setSocket(socket);

    socket?.on("connected", (data: { id: string }) => {
      console.log("connected", data);
      dispatch(setUserId(data));

      setTimeout(() => {
        socket.emit("RTClogin", { id: data.id, user });
      }, 500);
    });

    const pingInterval = setInterval(() => {
      socket.emit("ping");
    }, 5000);

    socket.on("pong", (serverTime) => {
      const endTime = Date.now();
      const pingTime = Math.abs(endTime - serverTime);
      dispatch(setSocketLatency(pingTime));
    });

    socket.on("new-message", (data: Message) => {
      dispatch(addNewMessage(data));
    });

    socket.on("RTCuser-list", (data: any) => {
      console.log("RTCuser-list", data);
      dispatch(setOnlineUsers(data));
    });

    return () => {
      console.log("disconnecting socket");
      clearInterval(pingInterval);
      socket?.disconnect();
      dispatch(setUserId({ id: null }));
    };
  }, [user]);

  useEffect(() => {
    if (!socket) {
      console.log("no socket");
      return;
    }

    socketEventQueue.forEach((event) => {
      console.log("emitting event", event);
      socket.emit(event.name, event.data);
      dispatch(removeFromSocketEventQueue(event.id));
    });
  }, [socket, socketEventQueue.length]);

  return null;
}
