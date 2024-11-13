"use client";
import { useState, useEffect, useRef } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useGetMessagesByChannelQuery } from "@/store/services/appService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Message, SocketEvent } from "@/interfaces/app";
import { addToSocketEventQueue, removeNewMessage } from "@/store/state";
import { useToast } from "@/hooks/use-toast";
import useDayjs from "@/hooks/use-dayjs";

export default function TextChannel({ channelId }: { channelId: string }) {
  const server = useAppSelector((state) => state.app.currentServer);
  const channel = useAppSelector((state) =>
    state.app.currentServer?.channels.find((c) => c.id === channelId)
  );
  const dayjs = useDayjs();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const newMessages = useAppSelector((state) => state.app.newMessages);
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const {
    data: messages,
    isLoading: isMessagesLoading,
    error: messagesError,
  } = useGetMessagesByChannelQuery(channelId, {
    refetchOnMountOrArgChange: true,
  });
  const user = useAppSelector((state) => state.app.user);

  useEffect(() => {
    if (messages) {
      setAllMessages([...messages]);
    }
  }, [messages]);

  useEffect(() => {
    dispatch(
      addToSocketEventQueue({
        id: Math.random().toString(36).slice(2),
        name: "join-message-group",
        data: channelId,
      })
    );
    return () => {
      dispatch(
        addToSocketEventQueue({
          id: Math.random().toString(36).slice(2),
          name: "leave-message-group",
          data: channelId,
        })
      );
    };
  }, []);

  const sendMessage = () => {
    if (!message) return;
    dispatch(
      addToSocketEventQueue({
        id: Math.random().toString(36).slice(2),
        name: "add-new-message",
        data: {
          user_id: user?.id,
          content: message,
          channel_id: channelId,
        },
      })
    );
    setMessage("");
  };

  useEffect(() => {
    console.log("allMessages", allMessages);
    if (viewportRef.current && messages) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [allMessages]);

  useEffect(() => {
    const thisChatMessages = newMessages.filter(
      (message) => message.channel_id === channelId
    );
    if (thisChatMessages.length === 0) return;
    console.log("newMessages inserting", thisChatMessages);

    setAllMessages((prev) => [...prev, ...thisChatMessages]);
    dispatch(removeNewMessage(thisChatMessages.map((m) => m.id)));
    thisChatMessages
      .filter((m) => m.user_id !== user?.id)
      .forEach((m) => {
        toast({
          title: `${m.user?.name} #${channel?.name}-${server?.name}`,
          description: `${m.content}`,
        });
      });
  }, [messages, newMessages]);

  return (
    <>
      {isMessagesLoading ? (
        <div>Loading</div>
      ) : messagesError ? (
        <div>Error</div>
      ) : (
        <ScrollArea viewportRef={viewportRef} className="w-full h-full ">
          {(
            allMessages.sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            ) || []
          ).map((message) => (
            <Card key={message.id} className="mb-2 bg-sidebar animate-fade-in">
              <CardHeader className="flex-row gap-2 items-center justify-between p-4">
                <div className="flex justify-between items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={message?.user?.avatar}
                      alt={message?.user?.name}
                    />
                    <AvatarFallback>{message?.user?.name}</AvatarFallback>
                  </Avatar>
                  <CardTitle>{message?.user?.name}</CardTitle>
                </div>
                <span>
                  {dayjs(message.created_at).format("DD MMMM YYYY HH:mm")}
                </span>
              </CardHeader>
              <Separator />
              <CardContent className="p-4">
                <p className="whitespace-pre-line">{message.content}</p>
              </CardContent>
              {/* <Separator />
              <CardFooter className="p-4">
                <p>Some feature</p>
              </CardFooter> */}
            </Card>
          ))}
        </ScrollArea>
      )}
      <div className="flex gap-2 items-center w-full">
        <Textarea
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          className="w-full max-h-32"
          placeholder="Type your message here."
        />
        <Button variant={"outline"} onClick={sendMessage}>
          Send
        </Button>
      </div>
    </>
  );
}
