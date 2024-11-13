import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Channel } from './channel.entity';

@Entity()
export class Server {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  icon: string;

  @OneToMany(() => Channel, (channel) => channel.server)
  channels: Channel[];
}
