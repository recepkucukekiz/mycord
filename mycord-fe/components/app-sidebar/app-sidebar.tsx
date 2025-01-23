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

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      id: "100",
      title: "General",
      url: "100",
      icon: SquareTerminal,
    },
    {
      id: "200",
      title: "Playground",
      icon: SquareTerminal,
      items: [
        {
          id: "210",
          title: "History",
          url: "210",
        },
        {
          id: "220",
          title: "Starred",
          url: "220",
        },
        {
          id: "230",
          title: "Settings",
          url: "230",
        },
      ],
    },
    {
      id: "300",
      title: "Models",
      icon: Bot,
      items: [
        {
          id: "310",
          title: "Genesis",
          url: "310",
        },
        {
          id: "320",
          title: "Explorer",
          url: "320",
        },
        {
          id: "330",
          title: "Quantum",
          url: "330",
        },
      ],
    },
    {
      id: "400",
      title: "Documentation",
      icon: BookOpen,
      items: [
        {
          id: "410",
          title: "Introduction",
          url: "410",
        },
        {
          id: "420",
          title: "Get Started",
          url: "420",
        },
        {
          id: "430",
          title: "Tutorials",
          url: "430",
        },
        {
          id: "440",
          title: "Changelog",
          url: "440",
        },
      ],
    },
  ],
};

export default function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const disapatch = useAppDispatch();
  const isMicDisabled = useAppSelector((state) => state.app.isMicDisabled);
  const isHeadphoneDisabled = useAppSelector(
    (state) => state.app.isHeadphoneDisabled
  );
  const socketLatency = useAppSelector((state) => state.app.socketLatency);

  const channels = useAppSelector((state) => state.app.currentServer?.channels);

  const toggleManager = (values: string[]) => {
    disapatch(setIsMicDisabled({ value: values.includes("mic") }));
    disapatch(setIsHeadphoneDisabled({ value: values.includes("headphone") }));
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-0">
        <AspectRatio
          ratio={16 / 9}
          className="bg-center bg-cover"
          style={{
            backgroundImage:
              "url(https://cdn.discordapp.com/banners/1006824479730696242/a_2ca39fbd8a75de2d2258222090f73ef2.webp?size=240)",
          }}>
          <div className="flex items-start justify-between w-full p-2 bg-gradient-to-b from-zinc-800 to-transparent font-bold">
            Server ABC
          </div>
        </AspectRatio>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <NavMain items={channels?.filter((c) => c.channel_id == null) || []} />
      </SidebarContent>
      <Separator />
      <SidebarFooter className="p-0">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 p-2 w-full">
            <Signal size={16} color="green" />
            <span className="text-sm">webRTC Connected</span>
            <span className="ml-auto text-xs">{socketLatency} ms</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-1 w-full p-2">
            <NavUser />
            {/* <div className="flex items-center">
              <ToggleGroup
                defaultValue={[
                  isMicDisabled ? "mic" : "",
                  isHeadphoneDisabled ? "headphone" : "",
                ].filter(Boolean)}
                onValueChange={toggleManager}
                type="multiple">
                <ToggleGroupItem value="mic" aria-label="Toggle mic">
                  {isMicDisabled ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="headphone"
                  aria-label="Toggle headphone">
                  {isHeadphoneDisabled ? (
                    <HeadphoneOff className="h-4 w-4" />
                  ) : (
                    <Headphones className="h-4 w-4" />
                  )}
                </ToggleGroupItem>
              </ToggleGroup>
            </div> */}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
