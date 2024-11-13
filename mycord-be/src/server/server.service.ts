import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server } from 'entities/server.entity';
import { DeleteResult, IsNull, Repository } from 'typeorm';
import { CreateServerDto } from './server.dto';

@Injectable()
export class ServerService {
  constructor(
    @InjectRepository(Server)
    private serverRepository: Repository<Server>,
  ) {}

  async getAll(): Promise<Server[]> {
    return this.serverRepository.find();
  }

  async getById(id: string): Promise<Server> {
    return this.serverRepository.findOne({
      where: {
        id,
      },
      relations: ['channels', 'channels.channels'],
    });
  }

  async create(server: CreateServerDto): Promise<Server> {
    return this.serverRepository.save(server);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.serverRepository.delete({
      id,
    });
  }
}
