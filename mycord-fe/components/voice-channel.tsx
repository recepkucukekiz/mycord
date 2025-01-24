"use client";
import { useState, useEffect, useRef, MouseEventHandler } from "react";
import {
  setIsHeadphoneDisabled,
  setIsMicDisabled,
  setIsVideoDisabled,
} from "@/store/state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AspectRatio } from "./ui/aspect-ratio";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Input } from "./ui/input";
import Peer from "simple-peer";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import {
  MicOff,
  Mic,
  HeadphoneOff,
  Headphones,
  Video,
  VideoOff,
} from "lucide-react";

interface VideoAudio {
  video: boolean;
  audio: boolean;
}

interface UserVideoAudio {
  [key: string]: VideoAudio;
}

interface PeerInstance extends Peer.Instance {
  userName: string;
  peerID: string;
}

interface PeerRef {
  peerID: string;
  peer: Peer.Instance;
  userName: string;
}

const expandScreen = (e: any) => {
  const elem = e.target;

  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    /* Chrome, Safari & Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    /* IE/Edge */
    elem.msRequestFullscreen();
  }
};

export default function VoiceChannel({ channelId }: { channelId: string }) {
  const [socket, setSocket] = useState<Socket | undefined>();
  const user = useAppSelector((state) => state.app.user);
  const currentUser = user?.name || "User Unknown";
  const [peers, setPeers] = useState<PeerInstance[]>([]);
  const [userVideoAudio, setUserVideoAudio] = useState<UserVideoAudio>({
    localUser: { video: true, audio: true },
  });
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [displayChat, setDisplayChat] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [showVideoDevices, setShowVideoDevices] = useState(false);

  const peersRef = useRef<PeerRef[]>([]);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const userScreenRef = useRef<HTMLVideoElement>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);
  const userStream = useRef<MediaStream | null>(null);
  const roomId = channelId;

  const isMicDisabled = useAppSelector((state) => state.app.isMicDisabled);
  const isHeadphoneDisabled = useAppSelector(
    (state) => state.app.isHeadphoneDisabled
  );
  const isVideoDisabled = useAppSelector((state) => state.app.isVideoDisabled);

  const disapatch = useAppDispatch();

  const toggleMic = () => {
    disapatch(setIsMicDisabled({ value: !isMicDisabled }));
    setUserVideoAudio((prev) => {
      if (userStream.current) {
        const audioTrack = userStream.current.getAudioTracks()[0];
        console.log("audioTrack", audioTrack);
        if (audioTrack) audioTrack.enabled = !prev.localUser.audio;
      }
      return {
        ...prev,
        localUser: {
          video: prev.localUser.video,
          audio: !prev.localUser.audio,
        },
      };
    });
    socket?.emit("BE-toggle-camera-audio", { roomId, switchTarget: "audio" });
  };

  const toggleHeadphone = () => {
    disapatch(setIsHeadphoneDisabled({ value: !isHeadphoneDisabled }));
  };

  const toggleVideo = () => {
    disapatch(setIsVideoDisabled({ value: !isVideoDisabled }));
    setUserVideoAudio((prev) => {
      if (userVideoRef.current) {
        //@ts-ignore
        const videoTrack = userVideoRef.current.srcObject?.getVideoTracks()[0];
        if (videoTrack) videoTrack.enabled = !prev.localUser.video;
      }

      return {
        ...prev,
        localUser: {
          video: !prev.localUser.video,
          audio: prev.localUser.audio,
        },
      };
    });
    socket?.emit("BE-toggle-camera-audio", { roomId, switchTarget: "video" });
  };

  useEffect(() => {
    setSocket(io(process.env.NEXT_PUBLIC_API_URL + "/rtc"));
  }, []);

  useEffect(() => {
    if (!roomId || !currentUser) return;
    console.log("isVideoDisabled", isVideoDisabled);
    // Get Video Devices
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const filtered = devices.filter((device) => device.kind === "videoinput");
      setVideoDevices(filtered);
    });

    // Connect Camera & Mic
    navigator.mediaDevices
      .getUserMedia({ video: !isVideoDisabled, audio: !isMicDisabled })
      .then((stream) => {
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
        userStream.current = stream;

        socket?.emit("BE-join-room", { roomId, userName: currentUser });

        socket?.on("FE-user-join", (users: { userId: string; info: any }[]) => {
          console.log("[RTC] FE-user-join", users);
          const peers: PeerInstance[] = [];
          users.forEach(({ userId, info }) => {
            const { userName, video, audio } = info;

            if (userName !== currentUser) {
              const peer = createPeer(userId, socket?.id || "", stream);
              peer.userName = userName;
              peersRef.current.push({ peerID: userId, peer, userName });
              peers.push(peer);

              setUserVideoAudio((prev) => ({
                ...prev,
                [peer.userName]: { video, audio },
              }));
            }
          });
          setPeers(peers);
        });

        socket?.on("FE-receive-call", ({ signal, from, info }) => {
          console.log("[RTC] FE-receive-call", from, info);
          const { userName, video, audio } = info;
          const peer = addPeer(signal, from, stream);

          peer.userName = userName;
          peersRef.current.push({ peerID: from, peer, userName });
          setPeers((users) => [...users, peer]);
          setUserVideoAudio((prev) => ({
            ...prev,
            [peer.userName]: { video, audio },
          }));
        });

        socket?.on("FE-call-accepted", ({ signal, answerId }) => {
          console.log("[RTC] FE-call-accepted", answerId);
          const peerIdx = findPeer(answerId);
          peerIdx?.peer.signal(signal);
        });

        socket?.on("FE-user-leave", ({ userId, userName }) => {
          console.log("[RTC] FE-user-leave", userId, userName);
          const peerIdx = findPeer(userId);
          peerIdx?.peer.destroy();
          setPeers((users) =>
            users.filter(
              (user) => user.peerID !== (peerIdx?.peer as PeerInstance).peerID
            )
          );
          peersRef.current = peersRef.current.filter(
            ({ peerID }) => peerID !== userId
          );
        });
      });

    socket?.on("FE-toggle-camera", ({ userId, switchTarget }) => {
      console.log("[RTC] FE-toggle-camera", userId, switchTarget);
      const peerIdx = findPeer(userId);
      if (!peerIdx) return;

      setUserVideoAudio((preList) => {
        let video = preList[peerIdx.userName].video;
        let audio = preList[peerIdx.userName].audio;

        if (switchTarget === "video") video = !video;
        else audio = !audio;

        return {
          ...preList,
          [peerIdx.userName]: { video, audio },
        };
      });
    });

    return () => {
      // release camera & mic
      console.log("release camera & mic", userStream.current?.getTracks());
      userStream.current?.getTracks().forEach((track) => track.stop());
      goToBack();
      socket?.disconnect();
    };
  }, [socket, roomId, currentUser, isMicDisabled, isVideoDisabled]);

  const createPeer = (userId: string, caller: string, stream: MediaStream) => {
    console.log("[RTC] createPeer", userId, caller);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });
    peer.on("signal", (signal) => {
      console.log("[RTC] createPeer signal BE-call-user", userId, caller);
      socket?.emit("BE-call-user", {
        userToCall: userId,
        from: caller,
        signal,
      });
    });
    peer.on("disconnect", () => {
      console.log("[RTC] createPeer disconnect", userId);
      peer.destroy();
    });
    return peer as PeerInstance;
  };

  const addPeer = (
    incomingSignal: any,
    callerId: string,
    stream: MediaStream
  ) => {
    console.log("[RTC] addPeer", incomingSignal, callerId);
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on("signal", (signal) => {
      console.log("[RTC] addPeer signal BE-accept-call", callerId);
      socket?.emit("BE-accept-call", { signal, to: callerId });
    });
    peer.signal(incomingSignal);
    return peer as PeerInstance;
  };

  const findPeer = (id: string) =>
    peersRef.current.find((p) => p.peerID === id);

  const goToBack = () => {
    console.log("[RTC] goToBack BE-leave-room");
    socket?.emit("BE-leave-room", { roomId, leaver: currentUser });
    // sessionStorage.removeItem("user");
    // router.push("/");
  };

  // const clickScreenSharing = () => {
  //   if (!screenShare) {
  //     navigator.mediaDevices.getDisplayMedia().then((stream) => {
  //       const screenTrack = stream.getTracks()[0];

  //       peersRef.current.forEach(({ peer }) => {
  //         const oldTrack = peer.streams[0]
  //           .getTracks()
  //           .find((track) => track.kind === "video");
  //         const ustream = userStream.current;

  //         if (oldTrack && ustream) {
  //           peer.replaceTrack(oldTrack, screenTrack, ustream);
  //         }
  //       });

  //       // Listen click end
  //       screenTrack.onended = () => {
  //         peersRef.current.forEach(({ peer }) => {
  //           const oldTrack = peer.streams[0]
  //             .getTracks()
  //             .find((track) => track.kind === "video");
  //           const ustream = userStream.current;

  //           if (oldTrack && ustream) {
  //             peer.replaceTrack(screenTrack, oldTrack, ustream);
  //           }
  //         });
  //         if (userVideoRef.current) {
  //           userVideoRef.current.srcObject = userStream.current;
  //         }
  //         setScreenShare(false);
  //       };

  //       if (userVideoRef.current) {
  //         userVideoRef.current.srcObject = stream;
  //       }
  //       screenTrackRef.current = screenTrack;
  //       setScreenShare(true);
  //     });
  //   } else {
  //     if (screenTrackRef.current) {
  //       // @ts-ignore
  //       screenTrackRef.current.onended();
  //     }
  //   }
  // };

  // const clickScreenSharing = async () => {
  //   if (!screenShare) {
  //     try {
  //       const screenStream = await navigator.mediaDevices.getDisplayMedia();
  //       if (userScreenRef.current) {
  //         userScreenRef.current.srcObject = screenStream;
  //       }

  //       const screenTrack = screenStream.getVideoTracks()[0];
  //       const cameraStream = userStream.current; // Kamera akışını referans alın

  //       if (!cameraStream) return;

  //       // Kamera ve ekran akışlarını birleştiren yeni bir MediaStream oluşturun
  //       const combinedStream = new MediaStream([
  //         ...cameraStream.getVideoTracks(),
  //         ...cameraStream.getAudioTracks(),
  //         screenTrack,
  //       ]);

  //       // Tüm peer'lara yeni akışı gönderin
  //       peersRef.current.forEach(({ peer }) => {
  //         combinedStream.getTracks().forEach((track) => {
  //           peer.addTrack(track, combinedStream);
  //         });
  //       });

  //       // // Kullanıcının ekranında ekran paylaşımını göster
  //       // if (userVideoRef.current) {
  //       //   userVideoRef.current.srcObject = screenStream;
  //       // }

  //       // Ekran paylaşımı sona erdiğinde varsayılan kamera akışına geri dön
  //       screenTrack.onended = () => {
  //         endScreenSharing();
  //       };

  //       screenTrackRef.current = screenTrack;
  //       setScreenShare(true);
  //     } catch (error) {
  //       console.error("Ekran paylaşımı başlatılamadı:", error);
  //     }
  //   } else {
  //     if (screenTrackRef.current) {
  //       //@ts-ignore
  //       screenTrackRef.current.onended();
  //     }
  //   }
  // };

  // const endScreenSharing = () => {
  //   peersRef.current.forEach(({ peer }) => {
  //     const cameraStream = userStream.current;

  //     // Tüm izleri yeniden gönder
  //     cameraStream?.getTracks().forEach((track) => {
  //       peer.addTrack(track, cameraStream);
  //     });
  //   });

  //   if (userVideoRef.current) {
  //     userVideoRef.current.srcObject = userStream.current;
  //   }
  //   setScreenShare(false);
  // };

  const clickBackground = () => {
    if (!showVideoDevices) return;

    setShowVideoDevices(false);
  };

  const clickCameraDevice = (event: any) => {
    if (
      event &&
      event.target &&
      event.target.dataset &&
      event.target.dataset.value
    ) {
      console.log("clickCameraDevice", event.target.dataset.value);
      const deviceId = event.target.dataset.value;
      const enabledAudio =
        //@ts-ignore
        userVideoRef.current?.srcObject?.getAudioTracks()[0].enabled;

      navigator.mediaDevices
        .getUserMedia({ video: { deviceId }, audio: enabledAudio })
        .then((stream) => {
          if (!userStream.current) return;

          const newStreamTrack = stream
            .getTracks()
            .find((track) => track.kind === "video");
          const oldStreamTrack = userStream.current
            .getTracks()
            .find((track) => track.kind === "video");

          oldStreamTrack && userStream.current.removeTrack(oldStreamTrack);
          newStreamTrack && userStream.current.addTrack(newStreamTrack);

          peersRef.current.forEach(({ peer }) => {
            if (!oldStreamTrack || !newStreamTrack || !userStream.current)
              return;
            peer.replaceTrack(
              oldStreamTrack,
              newStreamTrack,
              userStream.current
            );
          });
        });
    }
  };

  return (
    <div className="w-full h-full relative">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <Card key={currentUser} id="localUser">
          <AspectRatio ratio={16 / 9}>
            <video
              onClick={expandScreen}
              className="w-full h-full object-cover rounded-xl"
              ref={userVideoRef}
              muted
              autoPlay
              playsInline
            />
          </AspectRatio>
        </Card>
        {/* <Card key={currentUser+"screen"}>
          <AspectRatio ratio={16 / 9}>
            <video
              onClick={expandScreen}
              className="w-full h-full object-cover rounded-xl"
              ref={userScreenRef}
              muted
              autoPlay
              playsInline
            />
          </AspectRatio>
        </Card> */}
        {peers.map((peer) => (
          <Card key={peer.peerID} id={peer.peerID} className="relative">
            <AspectRatio ratio={16 / 9}>
              {userVideoAudio[peer.userName]?.video ? (
                <VideoCard peer={peer} />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-xl" />
              )}
            </AspectRatio>
            <div className="absolute top-2 right-2 flex gap-2">
              {userVideoAudio[peer.userName]?.audio ? null : (
                <MicOff className="h-4 w-4" />
              )}
              {userVideoAudio[peer.userName]?.video ? null : (
                <VideoOff className="h-4 w-4" />
              )}
            </div>
          </Card>
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
          <Button
            className="rounded-full"
            variant="outline"
            onClick={toggleVideo}>
            {isVideoDisabled ? (
              <Video className="h-4 w-4" />
            ) : (
              <VideoOff className="h-4 w-4" />
            )}
          </Button>

          {/* <div>
            {videoDevices.length > 0 &&
              videoDevices.map((device) => {
                return (
                  <div
                    key={device.deviceId}
                    onClick={clickCameraDevice}
                    data-value={device.deviceId}>
                    {device.label}
                  </div>
                );
              })}
          </div> */}
        </div>
      </div>
    </div>
  );
}

const VideoCard = ({ peer }: { peer: Peer.Instance }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    peer.on("stream", (stream) => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    });
  }, [peer]);

  return (
    <video
      onClick={expandScreen}
      className="w-full h-full object-cover rounded-xl"
      playsInline
      autoPlay
      ref={ref}
    />
  );
};
