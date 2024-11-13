"use client";

import { usePathname } from "@/app/navigation";
import { useMemo } from "react";
export function usePathparams() {
  const pathname = usePathname();

  return useMemo(() => {
    return {
      isInApp: pathname.split("/")[1] === "app",
      serverId: pathname.split("/")[2],
      channelId: pathname.split("/")[3],
    };
  }, [pathname]);
}
