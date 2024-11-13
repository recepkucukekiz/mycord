import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Server } from './server.entity';
import { TextMessage } from './text-message.entity';
import { ChannelType } from 'enums/channel-type.enum';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ChannelType,
  })
  type: ChannelType;

  @Column({
    nullable: true,
  })
  icon: string;

  @Column({
    nullable: true,
  })
  channel_id?: string;

  @ManyToOne(() => Channel, (channel) => channel.channels)
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @OneToMany(() => Channel, (channel) => channel.channel)
  channels: Channel[];

  @Column()
  server_id: string;

  @ManyToOne(() => Server, (server) => server.channels)
  @JoinColumn({ name: 'server_id' })
  server: Server;

  @OneToMany(() => TextMessage, (textMessage) => textMessage.channel)
  textMessages: TextMessage[];
}
