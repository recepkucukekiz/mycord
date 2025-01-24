import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/webrtc-test',
  cors: {
    origin: '*', // İzin verilen originleri buraya yazın
  },
})
export class WebRtcGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeUsers: Map<string, string> = new Map(); // Socket ID ve User ID eşleştirmesi

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const userId = this.activeUsers.get(client.id);
    if (userId) {
      this.activeUsers.delete(client.id);
      this.server.emit('user-left', { userId });
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, payload: { userId: string }) {
    const { userId } = payload;
    this.activeUsers.set(client.id, userId);
    client.broadcast.emit('user-joined', { userId });
    console.log(`User ${userId} joined the room`);
  }

  @SubscribeMessage('send-offer')
  handleSendOffer(
    client: Socket,
    payload: { offer: RTCSessionDescriptionInit; to: string },
  ) {
    const { offer, to } = payload;
    const socketId = Array.from(this.activeUsers.entries()).find(
      ([, userId]) => userId === to,
    )?.[0];
    this.server.to(socketId).emit('receive-offer', { offer, from: client.id });
    console.log(`Offer sent from ${client.id} to ${to}`);
  }

  @SubscribeMessage('send-answer')
  handleSendAnswer(
    client: Socket,
    payload: { answer: RTCSessionDescriptionInit; to: string },
  ) {
    const { answer, to } = payload;
    const socketId = Array.from(this.activeUsers.entries()).find(
      ([socketId, userId]) => socketId === client.id,
    )?.[1];
    this.server.to(to).emit('receive-answer', { answer, from:  socketId});
    console.log(`Answer sent from ${socketId} to ${to}`);
  }

  @SubscribeMessage('send-candidate')
  handleSendCandidate(
    client: Socket,
    payload: { candidate: RTCIceCandidate; to: string },
  ) {
    const { candidate, to } = payload;
    this.server
      .to(to)
      .emit('receive-candidate', { candidate, from: client.id });
    console.log(`Candidate sent from ${client.id} to ${to}`);
  }
}
