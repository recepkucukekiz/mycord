import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './channel.dto';

@ApiTags('channel')
@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get()
  async getAll() {
    return this.channelService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.channelService.getById(id);
  }

  @Post()
  async create(@Body() channel: CreateChannelDto) {
    return this.channelService.create(channel);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<DeleteResult> {
    return this.channelService.delete(id);
  }
}
