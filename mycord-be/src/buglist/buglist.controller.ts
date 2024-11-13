import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BugListService } from './buglist.service';
import { CreateBugDto } from './buglist.dto';

@ApiTags('buglist')
@Controller('buglist')
export class BugListController {
  constructor(private readonly buglistService: BugListService) {}

  @Get()
  async getAll() {
    return this.buglistService.getAll();
  }

  @Post()
  async create(@Body() bug: CreateBugDto) {
    return this.buglistService.create(bug);
  }
}
