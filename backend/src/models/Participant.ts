import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Conversation } from './Conversation';

@Entity('participants')
export class Participant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  user_id!: string;

  @Column('uuid')
  conversation_id!: string;

  @CreateDateColumn()
  joined_at!: Date;

  @Column({ default: false })
  is_admin!: boolean;

  @ManyToOne(() => User, user => user.participations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Conversation, conversation => conversation.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation!: Conversation;
}