import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty()
  content: string;

  @ApiProperty()
  channel_id: string;
}
