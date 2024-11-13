import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bug } from 'entities/bug.entity';
import { Repository } from 'typeorm';
import { CreateBugDto } from './buglist.dto';

@Injectable()
export class BugListService {
  constructor(
    @InjectRepository(Bug)
    private bugRepository: Repository<Bug>,
  ) {}

  async getAll(): Promise<Bug[]> {
    return this.bugRepository.find();
  }

  async create(channel: CreateBugDto): Promise<Bug> {
    return this.bugRepository.save(channel);
  }
}
