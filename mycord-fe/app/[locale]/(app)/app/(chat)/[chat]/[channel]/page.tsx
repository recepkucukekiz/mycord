"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import TextChannel from "@/components/text-channel";
import VoiceChannel from "@/components/voice-channel";
import { ChannelType } from "@/interfaces/app";
import { useAppSelector } from "@/store/hooks";
import { usePathparams } from "@/hooks/use-pathparams";
import VoiceChannelTest from "@/components/voice-channel-test";

const messages = Array.from({ length: 50 }).map((_, i, a) => {
  return {
    id: i,
    content: `Message ${i + 1}`,
  };
});

export default function ChatChannelPage() {
  const { channelId } = usePathparams();

  const channel = useAppSelector((state) =>
    state.app.currentServer?.channels.find((c) => c.id === channelId)
  );

  return channel ? (
    <div className="flex flex-col gap-2 justify-between items-center h-screen p-4">
      <Card className="mb-2 bg-sidebar w-full">
        <CardHeader>
          <CardTitle>{channel.name}</CardTitle>
        </CardHeader>
      </Card>
      {channel.type === ChannelType.TEXT ? (
        <TextChannel channelId={channelId} />
      ) : channel.type === ChannelType.VOICE ? (
        // <VoiceChannel channelId={channelId} />
        <VoiceChannelTest channelId={channelId} />
      ) : (
        <div>Category</div>
      )}
    </div>
  ) : (
    <div>Error</div>
  );
}
