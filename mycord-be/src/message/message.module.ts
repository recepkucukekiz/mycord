import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { TextMessage } from 'entities/text-message.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([TextMessage])],
  controllers: [MessageController],
  providers: [JwtService, MessageService],
  exports: [MessageService],
})
export class MessageModule {}
