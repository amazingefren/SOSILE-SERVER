import 'reflect-metadata';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsString, Length } from 'class-validator';

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

  @Field(() => String, {nullable: true})
  @IsString()
  role?: Role;

  // @Field(()=>any)
  // posts: Post[]
  // profile   UserProfile?
  // User -> Liked Posts
  // User -> Replied Posts
  // likes     Post[]    @relation(name: "likedBy")
  // replies      PostReply[] @relation("repliedBy")
}

@InputType()
export class UserCreateInput {
  @Field()
  @IsEmail()
  email: string

  @Field()
  @Length(1, 16)
  username: string

  @Field()
  password: string
}
