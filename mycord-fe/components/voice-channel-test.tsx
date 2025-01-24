import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { useAppSelector } from "@/store/hooks";
import { io } from "socket.io-client";

const SERVER_PORT = 3002; // Backend için kullandığınız port

const VoiceChannelTest = ({ channelId }: { channelId: string }) => {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerInstance = useRef<Peer | null>(null);

  const user = useAppSelector((state) => state.app.user);
  const [users, setUsers] = useState<any[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!channelId || !user) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL + "/rtc");
    socket?.emit("BE-join-room", { roomId: channelId, userName: user?.id });
    socket?.on("FE-user-join", (users: { userId: string; info: any }[]) => {
      console.log("[RTC] FE-user-join", users);
      users.forEach(({ userId, info }) => {
        if (info.userName === user?.id) return;
        setUsers((users) => [...users, { userId, info }]);
      });
    });

    const peer = new Peer(user?.id || "", {
      debug: 3,
      host: "192.168.1.34",
      port: SERVER_PORT,
      path: "/peerjs",
    });

    peer.on("open", (id) => {
      console.log("PeerJS Bağlandı! Peer ID:", id);
      setPeerId(id);
    });

    peer.on("call", (call) => {
      console.log("Gelen çağrı!", call);

      // Yerel video akışını alın
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          // Yerel akışı çağrıya ekle
          call.answer(stream);

          // Gelen uzaktan akışı yönet
          call.on("stream", (remoteStream) => {
            setRemoteStreams((streams) => [...streams, remoteStream]);
          });
        })
        .catch((err) => {
          console.error("Medya cihazı alınırken hata oluştu:", err);
        });
    });

    peerInstance.current = peer;

    return () => {
      peer.destroy();
    };
  }, [user, channelId]);

  const startCall = async (remotePeerId: string) => {
    if (!peerInstance.current) return;
    console.log("Çağrı başlatılıyor...", remotePeerId);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const call = peerInstance.current.call(remotePeerId, stream);

      call.on("stream", (remoteStream) => {
        setConnectedUsers((users) => [
          ...users,
          { userId: remotePeerId, info: {} },
        ]);
        setRemoteStreams((streams) => [...streams, remoteStream]);
      });

      call.on("close", () => {
        console.log("Çağrı kapandı.");
      });
    } catch (err) {
      console.error("Medya cihazı alınırken hata oluştu:", err);
    }
  };

  useEffect(() => {
    const notConnectedUsers = users.filter(
      (user) =>
        !connectedUsers.find(
          (connectedUser) => connectedUser.userId === user.userId
        )
    );

    console.log("Not connected users:", notConnectedUsers);

    notConnectedUsers.forEach((user) => {
      startCall(user.info.userName);
    });
  }, [users]);

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <p>Peer ID: {peerId || "Bağlanıyor..."}</p>
      <video
        ref={localVideoRef}
        autoPlay
        muted
        className="w-1/3 h-auto bg-black rounded"></video>
      <div className="flex flex-wrap">
        {remoteStreams.map((stream, index) => (
          <video
            key={index}
            autoPlay
            className="w-1/3 h-auto bg-black rounded m-2"
            ref={(video) => {
              if (video) {
                video.srcObject = stream;
              }
            }}></video>
        ))}
      </div>
    </div>
  );
};

export default VoiceChannelTest;
