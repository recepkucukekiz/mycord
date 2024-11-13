import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from 'entities/channel.entity';
import { DeleteResult, Repository, Not, IsNull } from 'typeorm';
import { CreateChannelDto } from './channel.dto';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
  ) {}

  async getAll(): Promise<Channel[]> {
    return this.channelRepository.find({
      relations: ['channels'],
      where: {
        channel_id: IsNull(),
      },
    });
  }

  async getById(id: string): Promise<Channel> {
    return this.channelRepository.findOne({
      where: { id },
      relations: ['channels'],
    });
  }

  async create(channel: CreateChannelDto): Promise<Channel> {
    return this.channelRepository.save(channel);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.channelRepository.delete({
      id,
    });
  }
}
