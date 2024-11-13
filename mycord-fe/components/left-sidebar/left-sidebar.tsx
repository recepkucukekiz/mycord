"use client";

import * as React from "react";
import { Settings, Plus } from "lucide-react";

import { NavMain } from "@/components/left-sidebar/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { Link } from "@/app/navigation";
import { Separator } from "../ui/separator";
import {
  useGetServersQuery,
  useAddServerMutation,
} from "@/store/services/appService";
import SocketProvider from "../socket-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUserQuery } from "@/store/services/authService";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/state";
import LanguageSelector from "../language-selector";
import ThemeSelector from "../theme-selector";

export function LeftSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { toast } = useToast();
  const { data: servers, isLoading: isServersLoading } = useGetServersQuery();
  const [addServer, { isLoading: isServerAddLoading }] = useAddServerMutation();
  const [serverName, setServerName] = React.useState("");
  const [serverIcon, setServerIcon] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = React.useState(false);
  const { data: currentUser } = useCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (currentUser) {
      console.log("currentUser", currentUser);
      dispatch(setUser(currentUser));
    }
  }, [currentUser]);

  const handleAddServer = async () => {
    try {
      await addServer({
        name: serverName,
        icon: serverIcon,
      }).unwrap();

      setServerName("");
      setServerIcon("");

      toast({
        title: "Success",
        description: "Server added",
      });

      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.data.message,
      });
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SocketProvider />
      <SidebarHeader>
        <Button size="sm" className="w-full">
          <Link href="/app">MY</Link>
        </Button>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <NavMain items={servers || []} />
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
          <DialogTrigger asChild>
            {/* <Plus className="mx-auto" /> */}
            <Button
              onClick={() => {
                setIsDialogOpen(true);
              }}
              variant="ghost"
              className="p-0">
              <Plus />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add server</DialogTitle>
              <DialogDescription>Add a new server</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  placeholder="Server name"
                  onChange={(e) => setServerName(e.target.value)}
                  value={serverName}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="icon" className="text-right">
                  Icon
                </Label>
                <Input
                  id="icon"
                  className="col-span-3"
                  placeholder="Server icon"
                  onChange={(e) => setServerIcon(e.target.value)}
                  value={serverIcon}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                isLoading={isServerAddLoading}
                type="submit"
                onClick={handleAddServer}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Separator />

        <Dialog
          onOpenChange={setIsSettingsDialogOpen}
          open={isSettingsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setIsSettingsDialogOpen(true);
              }}
              variant="ghost"
              className="p-0">
              <Settings />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>Change theme and language</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Language
                </Label>
                <LanguageSelector />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="icon" className="text-right">
                  Theme
                </Label>
                <ThemeSelector />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarFooter>
    </Sidebar>
  );
}
