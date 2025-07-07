import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, Length } from 'class-validator';
import { User } from './User';
import { Conversation } from './Conversation';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system'
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @IsNotEmpty()
  @Length(1, 1000)
  content!: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT
  })
  type!: MessageType;

  @Column({ default: false })
  is_edited!: boolean;

  @Column({ nullable: true })
  edited_at?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @Column('uuid')
  conversation_id!: string;

  @Column('uuid')
  sender_id!: string;

  @ManyToOne(() => Conversation, conversation => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation!: Conversation;

  @ManyToOne(() => User, user => user.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender!: User;
}