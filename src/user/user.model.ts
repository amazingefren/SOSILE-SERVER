import 'reflect-metadata';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Post, Comment } from '../post/post.model';
import { IsEmail, IsString, Length } from 'class-validator';

@ObjectType()
export class UserProfile {
  @Field(() => Int)
  id: number;
  @Field(() => String)
  biography: string;
  @Field(() => Number)
  userId: number;
  @Field(() => Int)
  username: string;
}
@ObjectType()
class UserCount {
  @Field(() => Number)
  followers?: number;
  @Field(() => Number)
  following?: number;
}
@ObjectType()
export class User {
  @Field(() => Int)
  id: number;
  @Field(() => String)
  @Length(1, 16)
  @IsString()
  username: string;
  @Field(() => String)
  @Length(1, 16)
  @IsString()
  displayName?: string;
  @Field()
  @IsEmail()
  email: string;
  @Field(() => UserProfile, { nullable: true })
  profile?: UserProfile;
  @Field(() => [Post], { nullable: true })
  posts?: Post[];
  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];
  @Field(() => [Post], { nullable: true })
  postLikes?: Post[];
  @Field(() => [Comment], { nullable: true })
  commentLikes?: Comment[];
  @Field(() => [User], { nullable: true })
  following?: User[];
  @Field(() => [User], { nullable: true })
  followers?: User[];
  @Field(() => UserCount, { nullable: true })
  _count?: UserCount;
}
@InputType()
export class UserIncludeOpts {
  @Field()
  followers?: boolean = false;
  @Field()
  following?: boolean = false;
  @Field()
  postLikes?: boolean = false;
  @Field()
  commentLikes?: boolean = false;
  @Field()
  posts?: boolean = false;
  @Field()
  profile?: boolean = false;
  @Field()
  comments?: boolean = false;
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
