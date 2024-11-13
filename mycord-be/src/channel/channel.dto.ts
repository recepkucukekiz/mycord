import { ApiProperty } from '@nestjs/swagger';
import { ChannelType } from 'enums/channel-type.enum';

export class CreateChannelDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  type: ChannelType;

  @ApiProperty()
  icon?: string;

  @ApiProperty()
  server_id: string;

  @ApiProperty()
  channel_id?: string;
}
