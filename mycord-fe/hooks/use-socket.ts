import { SocketContext } from "@/context/SocketContext";
import { useContext } from "react";

const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context.socket;
};

export default useSocket;