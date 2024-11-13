import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from '../entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { ServerModule } from './server/server.module';
import { ChannelModule } from './channel/channel.module';
import { Server } from 'entities/server.entity';
import { Channel } from 'entities/channel.entity';
import { TextMessage } from 'entities/text-message.entity';
import { MessageModule } from './message/message.module';
import { SocketModule } from './socket/socket.module';
import { Bug } from 'entities/bug.entity';
import { BugListModule } from './buglist/buglist.module';
import { RTCModule } from './rtc/rtc.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '45.147.46.133',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'db',
      entities: [User, Server, Channel, TextMessage, Bug],
      synchronize: true,
    }),
    RTCModule,
    SocketModule,
    AuthModule,
    ServerModule,
    ChannelModule,
    MessageModule,
    BugListModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
