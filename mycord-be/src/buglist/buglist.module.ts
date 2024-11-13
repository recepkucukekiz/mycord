import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bug } from 'entities/bug.entity';
import { BugListController } from './buglist.controller';
import { BugListService } from './buglist.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bug])],
  controllers: [BugListController],
  providers: [BugListService],
})
export class BugListModule {}
