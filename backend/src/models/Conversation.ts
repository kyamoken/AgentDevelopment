import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IsOptional, Length } from 'class-validator';
import { Message } from './Message';
import { Participant } from './Participant';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  @IsOptional()
  @Length(1, 100)
  title?: string;

  @Column({ default: false })
  is_group!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Message, message => message.conversation)
  messages!: Message[];

  @OneToMany(() => Participant, participant => participant.conversation)
  participants!: Participant[];
}