import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TextMessage } from 'entities/text-message.entity';
import { DeleteResult, Repository } from 'typeorm';
import { CreateMessageDto } from './message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(TextMessage)
    private textMessageRepository: Repository<TextMessage>,
  ) {}
  async getByChannelId(id: string): Promise<TextMessage[]> {
    return this.textMessageRepository.find({
      relations: ['user'],
      where: {
        channel_id: id,
      },
    });
  }

  async create(
    user_id: string,
    channel: CreateMessageDto,
  ): Promise<TextMessage> {
    const createdMessage = await this.textMessageRepository.save({
      ...channel,
      user_id,
    });

    return this.textMessageRepository.findOne({
      where: {
        id: createdMessage.id,
      },
      relations: ['user', 'channel', 'channel.server'],
    });
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.textMessageRepository.delete({
      id,
    });
  }
}
