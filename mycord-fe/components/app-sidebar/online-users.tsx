"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  SquareTerminal,
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
  Signal,
} from "lucide-react";

import { NavMain } from "@/components/app-sidebar/nav-main";
import { NavUser } from "@/components/app-sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "../ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setIsHeadphoneDisabled, setIsMicDisabled } from "@/store/state";
import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { ScrollArea } from "@/components/ui/scroll-area";

export default function OnlineUsers({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const onlineUsers = useAppSelector((state) => state.app.onlineUsers);

  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-0">
        <h3 className="text-lg font-bold p-4">Online Users</h3>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <ScrollArea className="">
          <div className="p-2">
            {onlineUsers.map((online) => (
              <div
                key={online.id}
                className="text-sm hover:bg-zinc-700 hover:rounded-lg p-2 mb-2 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={online.user.avatar}
                    alt={online.user.name}
                  />
                  <AvatarFallback>{online.user.name}</AvatarFallback>
                </Avatar>
                {online.user.name}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SidebarContent>
      <Separator />
    </Sidebar>
  );
}
