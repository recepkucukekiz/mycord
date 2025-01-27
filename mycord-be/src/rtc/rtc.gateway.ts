import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface SocketList {
  [socketId: string]: {
    userName: string;
    video: boolean;
    audio: boolean;
  };
}

@WebSocketGateway({ namespace: '/rtc', cors: true }) // Adjust port/namespace as needed
export class RTCGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private socketList: SocketList = {};
  private socketUserIdMap: { [socketId: string]: string } = {};
  private userMediaStates: {
    [userId: string]: { mic: boolean; video: boolean; headphone: boolean };
  } = {};
  handleConnection(socket: Socket) {
    console.log(`[RTC] New User connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    socket.disconnect();
    console.log('[RTC] User disconnected!');
    delete this.socketList[socket.id];
  }

  @SubscribeMessage('BE-join-room')
  async joinRoom(
    @MessageBody() data: { roomId: string; userName: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const { roomId, userName } = data;
    console.log('[RTC] BE-join-room', roomId, userName);

    socket.join(roomId);
    this.socketList[socket.id] = { userName, video: true, audio: true };

    const clients = await this.server.in(roomId).fetchSockets();
    const users = clients.map((client) => ({
      userId: client.id,
      info: this.socketList[client.id],
    }));

    socket.broadcast.to(roomId).emit('FE-user-join', users);
  }

  @SubscribeMessage('BE-call-user')
  callUser(
    @MessageBody() data: { userToCall: string; from: string; signal: any },
    @ConnectedSocket() socket: Socket,
  ) {
    const { userToCall, from, signal } = data;
    this.server.to(userToCall).emit('FE-receive-call', {
      signal,
      from,
      info: this.socketList[socket.id],
    });
  }

  @SubscribeMessage('BE-accept-call')
  acceptCall(
    @MessageBody() data: { signal: any; to: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const { signal, to } = data;
    this.server.to(to).emit('FE-call-accepted', {
      signal,
      answerId: socket.id,
    });
  }

  @SubscribeMessage('BE-send-message')
  sendMessage(
    @MessageBody() data: { roomId: string; msg: string; sender: string },
  ) {
    const { roomId, msg, sender } = data;
    this.server.to(roomId).emit('FE-receive-message', { msg, sender });
  }

  @SubscribeMessage('BE-leave-room')
  leaveRoom(
    @MessageBody() data: { roomId: string; leaver: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const { roomId } = data;
    delete this.socketList[socket.id];
    socket.leave(roomId);
    socket.broadcast.to(roomId).emit('FE-user-leave', {
      userId: socket.id,
      userName: this.socketList[socket.id]?.userName,
    });
  }

  @SubscribeMessage('BE-toggle-camera-audio')
  toggleCameraAudio(
    @MessageBody() data: { roomId: string; switchTarget: 'video' | 'audio' },
    @ConnectedSocket() socket: Socket,
  ) {
    const { roomId, switchTarget } = data;
    const user = this.socketList[socket.id];

    if (user) {
      if (switchTarget === 'video') {
        user.video = !user.video;
      } else if (switchTarget === 'audio') {
        user.audio = !user.audio;
      }
      socket.broadcast.to(roomId).emit('FE-toggle-camera', {
        userId: socket.id,
        switchTarget,
      });
    }
  }

  @SubscribeMessage('join-room')
  async userJoinRoom(
    @MessageBody() data: { roomId: string; userId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const { roomId, userId } = data;
    socket.join(roomId);

    this.socketUserIdMap[socket.id] = userId;

    const clients = await this.server.in(roomId).fetchSockets();
    const roomUserIdList = [];
    clients.forEach((client) => {
      const userId = this.socketUserIdMap?.[client.id];
      if (userId) {
        roomUserIdList.push(userId);
      }
    });

    socket.broadcast.to(roomId).emit('room-user-list', {
      roomId: roomId,
      users: roomUserIdList,
    });
  }

  @SubscribeMessage('leave-room')
  async userLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const { roomId } = data;
    socket.leave(roomId);

    delete this.socketUserIdMap[socket.id];
    delete this.userMediaStates[this.socketUserIdMap?.[socket.id]]; // TODO

    const clients = await this.server.in(roomId).fetchSockets();
    const roomUserIdList = [];
    clients.forEach((client) => {
      const userId = this.socketUserIdMap?.[client.id];
      if (userId) {
        roomUserIdList.push(userId);
      }
    });

    socket.broadcast.to(roomId).emit('room-user-list', {
      roomId: roomId,
      users: roomUserIdList,
    });

    this.server.to(roomId).emit('media-state', {
      roomId: roomId,
      userMediaStates: this.userMediaStates,
    });
  }

  @SubscribeMessage('update-media-state')
  async mediaState(
    @MessageBody()
    data: { roomId: string; mic: boolean; video: boolean; headphone: boolean },
    @ConnectedSocket() socket: Socket,
  ) {
    // TODO
    const { roomId, mic, video, headphone } = data;
    const userId = this.socketUserIdMap?.[socket.id];
    this.userMediaStates[userId] = { mic, video, headphone };

    this.server.to(roomId).emit('media-state', {
      roomId: roomId,
      userMediaStates: this.userMediaStates,
    });
  }
}
