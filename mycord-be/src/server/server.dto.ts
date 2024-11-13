import { ApiProperty } from '@nestjs/swagger';

export class CreateServerDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  icon?: string;
}
