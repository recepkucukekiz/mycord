import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { MessageService } from 'src/message/message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextMessage } from 'entities/text-message.entity';
import { User } from 'entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([TextMessage, User])],
  controllers: [],
  providers: [JwtService, SocketService, SocketGateway, MessageService, AuthService],
})
export class SocketModule {}
