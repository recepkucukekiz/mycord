import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @ApiProperty()
  name: string;

  @Column({
    unique: true,
  })
  @ApiProperty()
  email: string;

  @Column({
    select: false,
  })
  password: string;

  @Column()
  @ApiProperty()
  avatar: string;
}
