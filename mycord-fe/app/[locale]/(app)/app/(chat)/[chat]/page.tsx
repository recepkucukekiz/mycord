"use client";

import { useAppSelector } from "@/store/hooks";
export default function ChatPage() {
  const server = useAppSelector((state) => state.app.currentServer);

  return (
    <div>
      <p>Chat server home page yani</p>
      {JSON.stringify(server)}
    </div>
  );
}
