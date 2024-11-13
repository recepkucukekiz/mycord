import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { ServerService } from './server.service';
import { CreateServerDto } from './server.dto';

@ApiTags('server')
@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Get()
  async getAll() {
    return this.serverService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.serverService.getById(id);
  }

  @Post()
  async create(@Body() server: CreateServerDto) {
    return this.serverService.create(server);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<DeleteResult> {
    return this.serverService.delete(id);
  }
}
