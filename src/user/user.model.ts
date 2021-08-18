import 'reflect-metadata';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Post } from '../post/post.model';
import { IsEmail, IsString, Length } from 'class-validator';
import { PostReply, Prisma } from '@prisma/client';

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

@InputType()
export class UserAuthIncludeOpts {
  @Field()
  followers?: boolean = false;
  @Field()
  following?: boolean = false;
  @Field()
  likes?: boolean = false;
  @Field()
  posts?: boolean = false;
  @Field()
  profile?: boolean = false;
  @Field()
  replies?: boolean = false;
}

@InputType()
export class UserUniqueInput {
  @Field({ nullable: true })
  id?: number;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  email?: string;
}
