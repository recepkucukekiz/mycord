"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { io, Socket } from "socket.io-client";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  MicOff,
  Mic,
  HeadphoneOff,
  Headphones,
  Video,
  VideoOff,
} from "lucide-react";
import { cn, isNullOrUndefined } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const VoiceChannelTest = ({ channelId }: { channelId: string }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerInstance = useRef<Peer | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<
    { userId: string; stream: MediaStream }[]
  >([]);

  const user = useAppSelector((state) => state.app.user);
  const [users, setUsers] = useState<string[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [userVideoAudio, setUserVideoAudio] = useState<{
    [userId: string]: { mic: boolean; video: boolean; headphone: boolean };
  }>({});

  // const isMicDisabled = useAppSelector((state) => state.app.isMicDisabled);
  // const isHeadphoneDisabled = useAppSelector(
  //   (state) => state.app.isHeadphoneDisabled
  // );
  // const isVideoDisabled = useAppSelector((state) => state.app.isVideoDisabled);
  // const disapatch = useAppDispatch();

  const [isMicDisabled, setIsMicDisabled] = useState(false);
  const [isHeadphoneDisabled, setIsHeadphoneDisabled] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);

  const toggleMic = () => {
    if (!user) return;
    // disapatch(setIsMicDisabled({ value: !isMicDisabled }));
    setIsMicDisabled(!isMicDisabled);
    setUserVideoAudio((prev) => {
      if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) audioTrack.enabled = !prev[user.id].mic;
      }
      return {
        ...prev,
        [user.id]: {
          video: false, // prev[user.id].video,
          mic: !prev[user.id].mic,
          headphone: prev[user.id].headphone,
        },
      };
    });
    socket?.emit("update-media-state", {
      roomId: channelId,
      mic: isMicDisabled,
      video: isVideoDisabled,
      headphone: isHeadphoneDisabled,
    });
  };

  const toggleHeadphone = () => {
    if (!user) return;

    remoteStreams.forEach(({ stream }) => {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = isHeadphoneDisabled;
      });
    });

    // disapatch(setIsHeadphoneDisabled({ value: !isHeadphoneDisabled }));
    setIsHeadphoneDisabled(!isHeadphoneDisabled);
    setUserVideoAudio((prev) => {
      return {
        ...prev,
        [user.id]: {
          video: prev[user.id].video,
          mic: prev[user.id].mic,
          headphone: !prev[user.id].headphone,
        },
      };
    });
    socket?.emit("update-media-state", {
      roomId: channelId,
      mic: isMicDisabled,
      video: isVideoDisabled,
      headphone: isHeadphoneDisabled,
    });
  };

  const toggleVideo = () => {
    console.log("toggle video");
    if (!user) return;
    socket?.emit("update-media-state", {
      roomId: channelId,
      mic: isMicDisabled,
      video: !isVideoDisabled,
      headphone: isHeadphoneDisabled,
    });

    if (isVideoDisabled) {
      localStream?.getVideoTracks().forEach((track) => {
        track.enabled = true;
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    } else {
      localStream?.getVideoTracks().forEach((track) => {
        track.enabled = false;
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    }

    // disapatch(setIsVideoDisabled({ value: !isVideoDisabled }));
    setIsVideoDisabled(!isVideoDisabled);

    setUserVideoAudio((prev) => {
      return {
        ...prev,
        [user.id]: {
          video: false, // !prev[user.id].video,
          mic: prev[user.id].mic,
          headphone: prev[user.id].headphone,
        },
      };
    });
  };

  useEffect(() => {
    if (isNullOrUndefined(channelId, socket, isMicDisabled, isVideoDisabled))
      return;

    socket?.emit("update-media-state", {
      roomId: channelId,
      mic: !isMicDisabled,
      video: false, // !isVideoDisabled,
      headphone: !isHeadphoneDisabled,
    });
  }, [channelId, socket, isMicDisabled, isVideoDisabled]);

  useEffect(() => {
    if (isNullOrUndefined(channelId, user)) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL + "/rtc");
    setSocket(socket);

    socket.emit("join-room", { roomId: channelId, userId: user?.id });

    socket.on("room-user-list", (data: { roomId: string; users: string[] }) => {
      const { roomId, users } = data;
      if (roomId !== channelId) return;
      setUsers(users);
      setRemoteStreams((prev) => {
        return prev.filter((stream) => users.includes(stream.userId));
      });
      setConnectedUsers((prev) => {
        return prev.filter((connectedUser) => users.includes(connectedUser));
      });
    });

    socket.on(
      "media-state",
      (data: {
        roomId: string;
        userMediaStates: {
          [userId: string]: {
            mic: boolean;
            video: boolean;
            headphone: boolean;
          };
        };
      }) => {
        const { roomId, userMediaStates } = data;
        if (roomId !== channelId) return;

        setUserVideoAudio(userMediaStates);
      }
    );

    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        setLocalStream(stream);

        // stream.getVideoTracks().forEach((track) => {
        //   track.enabled = false;
        // });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const peer = new Peer(user?.id || "", {
          debug: 2,
          host: process.env.NEXT_PUBLIC_PEER_SERVER_URL,
          port: 3002,
          path: "/peerjs",
        });

        peer.on("call", (call) => {
          call.answer(stream);

          call.on("stream", (remoteStream) => {
            setRemoteStreams((streams) => {
              if (streams.find((stream) => stream.userId === call.peer)) {
                return streams;
              }
              return [
                ...streams,
                {
                  userId: call.peer,
                  stream: remoteStream,
                },
              ];
            });
            setConnectedUsers((connectedUsers) => {
              if (connectedUsers.includes(call.peer)) {
                return connectedUsers;
              }
              return [...connectedUsers, call.peer];
            });
          });

          call.on("close", () => {
            setRemoteStreams((streams) =>
              streams.filter((stream) => stream.userId !== call.peer)
            );
            setConnectedUsers((connectedUsers) =>
              connectedUsers.filter(
                (connectedUser) => connectedUser !== call.peer
              )
            );
            setUsers((users) => users.filter((user) => user !== call.peer));
          });
        });

        peerInstance.current = peer;
      });

    return () => {
      peerInstance.current?.destroy();
      socket.emit("leave-room", {
        roomId: channelId,
      });
    };
  }, [channelId, user]);

  useEffect(() => {
    let notConnectedUsers = users.filter(
      (user) => !connectedUsers.find((connectedUser) => connectedUser === user)
    );

    notConnectedUsers = notConnectedUsers.filter((u) => u !== user?.id);

    notConnectedUsers.forEach((user) => {
      if (!peerInstance.current) return;
      const call = peerInstance.current.call(user, localStream!);

      call.on("stream", (remoteStream) => {
        setRemoteStreams((streams) => {
          if (streams.find((stream) => stream.userId === call.peer)) {
            return streams;
          }
          return [
            ...streams,
            {
              userId: call.peer,
              stream: remoteStream,
            },
          ];
        });
        setConnectedUsers((connectedUsers) => {
          if (connectedUsers.includes(call.peer)) {
            return connectedUsers;
          }
          return [...connectedUsers, call.peer];
        });
      });
    });
  }, [users]);

  return (
    <div className="w-full h-full relative">
      <div className="flex flex-wrap gap-4 justify-center">
        <VideoCard
          key={"local"}
          userId={user?.id!}
          videoRef={localVideoRef as RefObject<HTMLVideoElement>}
          mediaState={userVideoAudio[user?.id!]}
        />

        {remoteStreams.map(({ userId, stream }) => (
          <VideoCard
            key={userId}
            userId={userId}
            stream={stream}
            mediaState={userVideoAudio[userId]}
          />
        ))}
      </div>

      <div className=" bottom-2 w-full absolute flex justify-center items-center">
        <div className="flex gap-2 ">
          <Button
            className="rounded-full"
            variant="outline"
            onClick={toggleMic}>
            {isMicDisabled ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <Button
            className="rounded-full"
            variant="outline"
            onClick={toggleHeadphone}>
            {isHeadphoneDisabled ? (
              <HeadphoneOff className="h-4 w-4" />
            ) : (
              <Headphones className="h-4 w-4" />
            )}
          </Button>
          {/* <Button
            className="rounded-full"
            variant="outline"
            onClick={toggleVideo}>
            {isVideoDisabled ? (
              <Video className="h-4 w-4" />
            ) : (
              <VideoOff className="h-4 w-4" />
            )}
          </Button> */}
        </div>
      </div>
    </div>
  );
};

const VideoCard = ({
  userId,
  stream,
  videoRef,
  mediaState,
}: {
  userId: string;
  stream?: MediaStream;
  videoRef?: React.RefObject<HTMLVideoElement>;
  mediaState: { mic: boolean; video: boolean; headphone: boolean };
}) => {
  const [user, setUser] = useState<{ name: string; avatar: string } | null>(
    null
  );
  const onlineUsers = useAppSelector((state) => state.app.onlineUsers);

  useEffect(() => {
    console.log(userId);
    const user = onlineUsers.find((online) => online.user.id === userId);
    if (user) {
      setUser(user.user);
    }
  }, [userId]);

  return (
    <Card className="relative">
      {videoRef ? (
        <video
          muted
          key={userId}
          autoPlay
          className={cn(
            "w-96 h-full object-cover rounded-xl",
            mediaState?.video ? "" : "hidden"
          )}
          ref={videoRef}></video>
      ) : (
        <video
          key={userId}
          autoPlay
          className={cn(
            "w-96 h-full object-cover rounded-xl",
            mediaState?.video ? "" : "hidden"
          )}
          ref={(video) => {
            if (video) {
              video.srcObject = stream!;
            }
          }}></video>
      )}

      {user ? (
        <div
          className={cn(
            "w-96 h-48 flex flex-col gap-2 items-center justify-center",
            mediaState?.video ? "hidden" : ""
          )}>
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name}</AvatarFallback>
          </Avatar>
          {user.name}
        </div>
      ) : (
        <div>loading</div>
      )}

      <div className="absolute top-2 right-2 flex gap-4">
        {mediaState?.mic ? null : <MicOff className="h-6 w-6" />}
        {mediaState?.video ? null : <VideoOff className="h-6 w-6" />}
        {mediaState?.headphone ? null : <HeadphoneOff className="h-6 w-6" />}
      </div>
    </Card>
  );
};

export default VoiceChannelTest;
