import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { MessageService } from './message.service';
import { CreateMessageDto } from './message.dto';
import { AuthGuard } from 'guards/auth.guard';
import { RequestObject } from 'req.type';

@ApiTags('message')
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('by-channel/:id')
  async getByChannelId(@Param('id') id: string) {
    return this.messageService.getByChannelId(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Req() request: RequestObject,
    @Body() channel: CreateMessageDto,
  ) {
    return this.messageService.create(request.token.id, channel);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<DeleteResult> {
    return this.messageService.delete(id);
  }
}
