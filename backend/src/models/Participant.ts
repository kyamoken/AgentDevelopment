import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Conversation } from './Conversation';

@Entity('participants')
export class Participant {
  @PrimaryColumn('uuid')
  user_id!: string;

  @PrimaryColumn('uuid')
  conversation_id!: string;

  @CreateDateColumn()
  joined_at!: Date;

  @ManyToOne(() => User, user => user.participations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Conversation, conversation => conversation.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation!: Conversation;
}