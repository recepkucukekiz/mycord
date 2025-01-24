"use client";

import { useAppSelector } from "@/store/hooks";
export default function ChatPage() {
  const server = useAppSelector((state) => state.app.currentServer);

  return (
    <div className="p-4">
      <h1 className="font-bold">{server?.name}</h1>
    </div>
  );
}
