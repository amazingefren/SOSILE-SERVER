import 'reflect-metadata';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Post } from '../post/post.model';
import { IsEmail, IsString, Length } from 'class-validator';
import { PostReply } from '@prisma/client';

@ObjectType()
export class UserProfile {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  biography: string;

  @Field(() => Number)
  userId: number;
}

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  @Length(1, 16)
  @IsString()
  username: string;

  @Field()
  @IsEmail()
  email: string;

  @Field(() => UserProfile, { nullable: true })
  profile?: UserProfile;

  @Field(() => [Post], { nullable: true })
  posts?: Post[];

  @Field(() => [Post], { nullable: true })
  likes?: Post[];
  replies?: PostReply[];
}
