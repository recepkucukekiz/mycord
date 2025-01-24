"use client";

import {
  ChevronRight,
  HomeIcon,
  Bell,
  Plus,
  TableProperties,
  Hash,
  Volume2,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link } from "@/app/navigation";
import { useCallback, useMemo, useState } from "react";
import { Separator } from "../ui/separator";
import { Channel, ChannelType } from "@/interfaces/app";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
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
import { Button } from "../ui/button";
import { useAddChannelMutation } from "@/store/services/appService";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector } from "@/store/hooks";
import { usePathparams } from "@/hooks/use-pathparams";
export function NavMain({ items }: { items: Channel[] }) {
  const { serverId, channelId } = usePathparams();
  const homepagePath = useMemo(() => `/app/${serverId}`, [serverId]);
  const isActive = useCallback(
    (id: string) => {
      const item = items.find((item) => item.id === id);
      if (!item) return false;

      return item.channels?.some((subItem) => subItem.id === channelId);
    },
    [items, serverId]
  );

  const { toast } = useToast();

  const [addChannel, { isLoading: isChannelAddLoading }] =
    useAddChannelMutation();
  const [channelName, setChannelName] = useState("");
  const [channelIcon, setChannelIcon] = useState("");
  const [channelType, setChannelType] = useState(ChannelType.TEXT);
  const [channelCategory, setChannelCategory] = useState<string>();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const categoryList = useMemo(
    () =>
      items
        .filter((item) => item.type === ChannelType.CATEGORY)
        .map((item) => ({
          value: item.id,
          label: item.name,
        })),
    [items]
  );

  const handleAddChannel = async () => {
    try {
      await addChannel({
        name: channelName,
        icon: channelIcon,
        type: channelType,
        server_id: serverId,
        channel_id:
          channelType !== ChannelType.CATEGORY ? channelCategory : undefined,
      }).unwrap();

      setChannelName("");
      setChannelIcon("");
      setChannelType(ChannelType.TEXT);

      toast({
        title: "Success",
        description: "Channel added",
      });

      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.data.message,
      });
    }
  };

  const getIconByType = useCallback((type: ChannelType) => {
    switch (type) {
      case ChannelType.CATEGORY:
        return <TableProperties />;
      case ChannelType.TEXT:
        return <Hash />;
      case ChannelType.VOICE:
        return <Volume2 />;
    }
  }, []);

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuButton asChild>
          <Link href={homepagePath}>
            <HomeIcon />
            <span>Home</span>
          </Link>
        </SidebarMenuButton>
        <Separator />
        {items.length > 0 &&
          items.map((item) => (
            <Collapsible
              key={item.name}
              asChild
              defaultOpen={isActive(item.id)}
              className="group/collapsible">
              <SidebarMenuItem>
                {item.type === ChannelType.CATEGORY ? (
                  <div>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.name}>
                        {getIconByType(item.type)}
                        <span>{item.name}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.channels?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.name}>
                            <SidebarMenuSubButton asChild>
                              {subItem.type === ChannelType.VOICE ? (
                                <div>
                                  <SidebarMenuButton tooltip={subItem.name} isActive={subItem.id === channelId}>
                                    <Link
                                      href={homepagePath + "/" + subItem.id}
                                      className="flex w-full items-center gap-2">
                                      {getIconByType(subItem.type)}
                                      <span>{subItem.name}</span>
                                      {/* <div className="ml-auto max-h-full flex -space-x-1 *:ring *:ring-background">
                                        <Avatar className="w-4 h-4">
                                          <AvatarImage src="https://github.com/recepkucukekiz.png" />
                                          <AvatarFallback>test</AvatarFallback>
                                        </Avatar>
                                        <Avatar className="w-4 h-4">
                                          <AvatarImage src="https://github.com/recepkucukekiz.png" />
                                          <AvatarFallback>test</AvatarFallback>
                                        </Avatar>
                                        <Avatar className="w-4 h-4">
                                          <AvatarImage src="https://github.com/recepkucukekiz.png" />
                                          <AvatarFallback>test</AvatarFallback>
                                        </Avatar>
                                      </div> */}
                                    </Link>
                                  </SidebarMenuButton>
                                </div>
                              ) : (
                                <div>
                                  <SidebarMenuButton asChild isActive={subItem.id === channelId}>
                                    <Link
                                      href={homepagePath + "/" + subItem.id}>
                                      {getIconByType(subItem.type)}
                                      <span>{subItem.name}</span>
                                    </Link>
                                  </SidebarMenuButton>
                                </div>
                              )}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </div>
                ) : item.type === ChannelType.VOICE ? (
                  <div>
                    <SidebarMenuButton tooltip={item.name} isActive={item.id === channelId}>
                      <Link
                        href={homepagePath + "/" + item.id}
                        className="flex w-full items-center gap-2">
                        {getIconByType(item.type)}
                        <span>{item.name}</span>
                        {/* <div className="ml-auto max-h-full flex -space-x-1 *:ring *:ring-background">
                          <Avatar className="w-4 h-4">
                            <AvatarImage src="https://github.com/recepkucukekiz.png" />
                            <AvatarFallback>test</AvatarFallback>
                          </Avatar>
                          <Avatar className="w-4 h-4">
                            <AvatarImage src="https://github.com/recepkucukekiz.png" />
                            <AvatarFallback>test</AvatarFallback>
                          </Avatar>
                          <Avatar className="w-4 h-4">
                            <AvatarImage src="https://github.com/recepkucukekiz.png" />
                            <AvatarFallback>test</AvatarFallback>
                          </Avatar>
                        </div> */}
                      </Link>
                    </SidebarMenuButton>
                  </div>
                ) : (
                  <div>
                    <SidebarMenuButton asChild isActive={item.id === channelId}>
                      <Link href={homepagePath + "/" + item.id}>
                        {getIconByType(item.type)}
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </div>
                )}
              </SidebarMenuItem>
            </Collapsible>
          ))}
        {items.length > 0 && <Separator />}
        <SidebarMenuItem>
          <SidebarMenuButton>
            <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
              <DialogTrigger asChild>
                <div className="flex items-center justify-center w-full gap-0">
                  <Plus className="mr-2" />
                  <span className="text-sm">Add channel</span>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add channel</DialogTitle>
                  <DialogDescription>Add a new channel</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      className="col-span-3"
                      placeholder="Channel name"
                      onChange={(e) => setChannelName(e.target.value)}
                      value={channelName}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="icon" className="text-right">
                      Icon
                    </Label>
                    <Input
                      id="icon"
                      className="col-span-3"
                      placeholder="Channel icon"
                      onChange={(e) => setChannelIcon(e.target.value)}
                      value={channelIcon}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select
                      key={"type"}
                      onValueChange={(val) =>
                        setChannelType(val as ChannelType)
                      }>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={ChannelType.CATEGORY}>
                            CATEGORY
                          </SelectItem>
                          <SelectItem value={ChannelType.TEXT}>TEXT</SelectItem>
                          <SelectItem value={ChannelType.VOICE}>
                            VOICE
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select
                      disabled={channelType === ChannelType.CATEGORY}
                      key={"category"}
                      onValueChange={(val) => setChannelCategory(val)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {categoryList.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    isLoading={isChannelAddLoading}
                    type="submit"
                    onClick={handleAddChannel}>
                    Save changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* <span className="text-sm flex items-center gap-1 w-full justify-center" ><Plus /> Add channel</span> */}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
