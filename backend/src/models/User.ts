import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { Message } from './Message';
import { Participant } from './Participant';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @Length(3, 30)
  username!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column()
  @IsNotEmpty()
  password_hash!: string;

  @Column({ nullable: true })
  avatar_url?: string;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Message, message => message.sender)
  messages!: Message[];

  @OneToMany(() => Participant, participant => participant.user)
  participations!: Participant[];
}