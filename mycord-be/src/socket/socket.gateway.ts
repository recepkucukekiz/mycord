import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { MessageService } from 'src/message/message.service';

@WebSocketGateway({ cors: true })
export class SocketGateway {
  constructor(
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
  ) {}
  @WebSocketServer() server: Server;
  USERS: {
    [key: string]: {
      id: string;
      name: string;
      email: string;
      avatar: string;
    };
  } = {};
  messageListeners: {
    [key: string]: string[];
  } = {};

  handleConnection(client: Socket) {
    console.log('New client connected, id:', client.id);
    client.emit('connected', { id: client.id });
  }

  handleDisconnect(client: Socket) {
    const user = this.USERS[client.id];
    console.log(
      `User ${user?.name} - ${user?.id} with client id ${client.id} is disconnected`,
    );
    delete this.USERS[client.id];
    this.notifyAllUsers();
  }

  @SubscribeMessage('ping')
  handlePing(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): void {
    client.emit('pong', Date.now());
  }

  @SubscribeMessage('RTClogin')
  handleRTCLogin(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log(`User ${data.user?.name}(${client.id}) logged in`);
    this.USERS[client.id] = data.user;
    this.notifyAllUsers();
  }

  private notifyAllUsers() {
    this.server.emit(
      'RTCuser-list',
      Object.entries(this.USERS).map(([id, user]) => ({ id, user })),
    );
  }

  @SubscribeMessage('add-new-message')
  async handleNewMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('New message:', data);
    const chatId = data.channel_id;

    const createdMsg = await this.messageService.create(data.user_id, {
      content: data.content,
      channel_id: data.channel_id,
    });

    if (this.messageListeners[chatId]) {
      const user = await this.authService.getUserById(data.user_id);
      this.messageListeners[chatId].forEach((id) => {
        this.server.to(id).emit('new-message', {
          ...data,
          id: createdMsg.id,
          created_at: createdMsg.created_at,
          user,
        });
      });
    }
  }

  @SubscribeMessage('join-message-group')
  joinMessageGroup(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): void {
    if (!this.messageListeners[data]) {
      this.messageListeners[data] = [];
    }
    this.messageListeners[data].push(client.id);
  }

  @SubscribeMessage('leave-message-group')
  leaveMessageGroup(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): void {
    if (this.messageListeners[data]) {
      this.messageListeners[data] = this.messageListeners[data].filter(
        (id) => id !== client.id,
      );
    }

    if (this.messageListeners[data]?.length === 0) {
      delete this.messageListeners[data];
    }
  }
}
