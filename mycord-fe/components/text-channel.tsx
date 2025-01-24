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
import { useAppSelector } from "@/store/hooks";
import { Message, SocketEvent } from "@/interfaces/app";
import { useToast } from "@/hooks/use-toast";
import useDayjs from "@/hooks/use-dayjs";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import useSocket from "@/hooks/use-socket";

export default function TextChannel({ channelId }: { channelId: string }) {
  const dayjs = useDayjs();
  const { toast } = useToast();
  const socket = useSocket();

  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [isBottom, setIsBottom] = useState(true);
  const [isThereNewMessage, setIsThereNewMessage] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const user = useAppSelector((state) => state.app.user);
  const server = useAppSelector((state) => state.app.currentServer);
  const channel = useAppSelector((state) =>
    state.app.currentServer?.channels.find((c) => c.id === channelId)
  );

  const {
    data: messages,
    isLoading: isMessagesLoading,
    error: messagesError,
  } = useGetMessagesByChannelQuery(channelId, {
    refetchOnMountOrArgChange: true,
  });

  const sendMessage = () => {
    if (!message) return;
    socket?.emit("add-new-message", {
      user_id: user?.id,
      content: message,
      channel_id: channelId,
    });
    setMessage("");
  };

  const scrollToBottom = () => {
    setIsThereNewMessage(false);
    if (viewportRef.current) {
      console.log(
        viewportRef.current.scrollTop,
        viewportRef.current.scrollHeight
      );
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  };

  const handleScroll = () => {
    const bottom =
      (viewportRef.current?.scrollHeight ?? 0) -
        (viewportRef.current?.scrollTop ?? 0) ===
      viewportRef.current?.clientHeight;
    if (bottom) {
      setIsThereNewMessage(false);
    }
    setIsBottom(bottom);
  };

  useEffect(() => {
    if (messages) {
      setAllMessages([...messages]);
    }

    if (viewportRef.current && messages) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }

    if (viewportRef.current) {
      viewportRef.current.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (viewportRef.current) {
        viewportRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [messages, viewportRef.current, channelId]);

  useEffect(() => {
    socket?.emit("join-message-group", channelId);

    socket?.on("new-message", (data: Message) => {
      if (data.channel_id === channelId) {
        setIsThereNewMessage(true);
        setAllMessages((prev) => [...prev, ...[data]]);
        if (data.user_id !== user?.id) {
          setIsBottom(false);
          toast({
            title: `${data.user?.name} #${channel?.name}-${server?.name}`,
            description: `${data.content}`,
          });
        } else {
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        }
      }
    });

    return () => {
      socket?.emit("leave-message-group", channelId);
    };
  }, [socket]);

  // useEffect(() => {
  //   console.log("viewportRef changed");
  //   if (viewportRef.current) {
  //     viewportRef.current.addEventListener("scroll", handleScroll);
  //   }
  //   return () => {
  //     if (viewportRef.current) {
  //       viewportRef.current.removeEventListener("scroll", handleScroll);
  //     }
  //   };
  // }, [viewportRef.current]);

  return (
    <>
      {isMessagesLoading ? (
        <div>Loading</div>
      ) : messagesError ? (
        <div>Error</div>
      ) : allMessages.length == 0 ? (
        <div>
          Notthing here, start the conversation by typing in the message box
        </div>
      ) : (
        <ScrollArea viewportRef={viewportRef} className="w-full h-full">
          {allMessages.map((message) => (
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
      <div
        className={cn(
          "justify-center items-center absolute bottom-20 hidden animate-fade-in",
          !isBottom && "flex"
        )}>
        <Button onClick={scrollToBottom} className="">
          {isThereNewMessage && "New Messages"}
          <ArrowDown />
        </Button>
      </div>
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
