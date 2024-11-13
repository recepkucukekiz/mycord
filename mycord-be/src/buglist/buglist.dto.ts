import { ApiProperty } from '@nestjs/swagger';

export class CreateBugDto {
  @ApiProperty()
  bug: string;
}
