"use client";

import { Link } from "@/app/navigation";
import StrIcon from "@/components/str-icon";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Server } from "@/interfaces/app";
import { useGetServersQuery } from "@/store/services/appService";

const ServerCard = ({ server }: { server: Server }) => {
  return (
    <Link key={server.id} href={`/app/${server.id}`}>
      <Card className="hover:bg-zinc-200 dark:hover:bg-zinc-600">
        <div className="flex flex-col justify-between items-center gap-2 p-4">
          <StrIcon icon={server.icon} />
          <span>{server.name}</span>
        </div>
      </Card>
    </Link>
  );
};

export default function AppPage() {
  const { data: servers, isLoading: isServersLoading } = useGetServersQuery();
  return (
    <div className="flex flex-col p-4 gap-4">
      <h3 className="font-bold text-xl">Servers</h3>
      <ScrollArea className="w-full h-full ">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {servers?.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
