"use client";

import AppSidebar from "@/components/app-sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAppDispatch } from "@/store/hooks";
import { useEffect } from "react";
import { useGetServerQuery } from "@/store/services/appService";
import { setCurrentServer } from "@/store/state";
import OnlineUsers from "@/components/app-sidebar/online-users";
import { usePathparams } from "@/hooks/use-pathparams";
export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dispatch = useAppDispatch();
  const { serverId } = usePathparams();

  const { data: server, isLoading } = useGetServerQuery(serverId, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (server) {
      dispatch(setCurrentServer(server));
    }
  }, [server]);

  return isLoading ? (
    <div>Loading</div>
  ) : (
    <SidebarProvider open={true}>
      <AppSidebar className="absolute" />
      <SidebarInset>{children}</SidebarInset>
      <OnlineUsers side="right" className="absolute" />
    </SidebarProvider>
  );
}
