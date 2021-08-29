import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { User } from '../user/user.model';
import 'reflect-metadata';

@ObjectType()
class PostCount {
  @Field(() => Number)
  likes?: number;
  @Field(() => Number)
  comments?: number;
}
@ObjectType()
class CommentCount {
  @Field(() => Number)
  likes?: number;
}
@ObjectType()
export class Post {
  @Field(() => Number)
  id: number;
  @Field(() => User, { nullable: true })
  author?: User;
  @Field(() => String)
  content: string;
  @Field(() => Date)
  date: Date;
  @Field(() => Date)
  updated: Date;
  @Field(() => [PostHistory], { nullable: true })
  history?: PostHistory[];
  @Field(() => [User], { nullable: true })
  likes?: User[];
  @Field(() => Boolean, { nullable: true })
  liked?: Boolean;
  @Field(() => [Post], { nullable: true })
  comments?: Comment[];
  @Field(() => [Post], { nullable: true })
  parents?: Post[];
  @Field(() => PostCount, { nullable: true })
  _count?: PostCount;
}
@InputType()
export class PostIncludeOpts {
  @Field()
  author?: boolean = false;
  @Field()
  history?: boolean = false;
  @Field()
  likes?: boolean = false;
  @Field()
  comments?: boolean = false;
}
@ObjectType()
export class Comment {
  @Field(() => Number)
  id: number;
  @Field(() => String)
  content: string;
  @Field(() => Date, { nullable: true })
  date?: Date;
  @Field(() => [User], { nullable: true })
  likes?: User[];
  @Field(() => User, { nullable: true })
  author?: User;
  @Field(() => Post, { nullable: true })
  post?: Post;
  @Field(() => CommentCount, { nullable: true })
  _count?: CommentCount;
}
@InputType()
export class CommentIncludeOpts {
  @Field()
  author?: boolean = false;
  @Field()
  likes?: boolean = false;
  @Field()
  post?: boolean = false;
}
@ObjectType()
export class PostHistory {
  @Field(() => Number, { nullable: true })
  id?: number;
  @Field(() => String, { nullable: true })
  content?: string;
  @Field(() => Date, { nullable: true })
  date?: Date;
  @Field(() => Post, { nullable: true })
  parent?: Post;
}
@InputType()
export class CreatePostInput {
  @Field({ nullable: false })
  content: string;
}
@ObjectType()
export class FeedPost {
  @Field(() => Number)
  id: number;
  @Field(() => User, { nullable: true })
  author?: User;
  @Field(() => String)
  content: string;
  @Field(() => Date)
  date: Date;
  @Field(() => Date)
  updated: Date;
  @Field(() => [PostHistory], { nullable: true })
  history?: PostHistory[];
  @Field(() => Boolean, { nullable: true })
  liked?: Boolean;
  /* @Field(() => [Post], { nullable: true })
  parents?: Post[]; */
  @Field(() => PostCount, { nullable: true })
  _count?: PostCount;
}

@InputType()
export class PostWhereInput {
  @Field(() => Number, { nullable: true })
  id?: number;
  @Field(() => String, { nullable: true })
  username?: string;
}
