import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BugStatus } from 'enums/bug-status.enum';

@Entity()
export class Bug {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bug: string;

  @Column({
    type: 'enum',
    enum: BugStatus,
    default: BugStatus.PENDING,
  })
  status: BugStatus = BugStatus.PENDING;
}
