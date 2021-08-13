import 'reflect-metadata';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Post } from '../post/post.model';
import { IsEmail, IsString, Length } from 'class-validator';
import { PostReply } from '@prisma/client';

type Role = 'USER' | 'ADMIN';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  @Length(1, 16)
  @IsString()
  username: string;

  @Field()
  // @IsEmail()
  email: string;

  // Auth Resolver?
  @Field(() => String, { nullable: true })
  @IsString()
  role?: Role;

  @Field(() => UserProfile)
  profile: UserProfile;

  @Field(() => [Post])
  posts: Post[];

  @Field(() => [Post])
  likes: Post[];
  replies: PostReply[];
}

@ObjectType()
export class UserProfile {
  @Field(() => Int)
  id: number;
  @Field(() => String)
  biography: string;

  @Field(() => User)
  user: User;

  @Field(() => Number)
  userId: number;
}

@InputType()
export class UserCreateInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Length(1, 16)
  username: string;

  @Field()
  password: string;
}
