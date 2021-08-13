import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../user/user.model';
import 'reflect-metadata';

@ObjectType()
export class Post {
  @Field(() => Number)
  id: number;

  @Field(() => User)
  author: User;

  @Field(() => Number)
  authorId: number;

  @Field(() => String)
  content: string;

  @Field(() => Date)
  date: Date;

  @Field(() => Date)
  updated: Date;

  @Field(() => [PostHistory])
  history: PostHistory[];

  @Field(() => [User])
  likes: User[];

  @Field(() => [Number])
  likedIds: number[];

  @Field(() => [Post])
  replies: Post[];
}

@ObjectType()
export class PostHistory {
  @Field(() => Number)
  id: number;

  @Field(() => String)
  content: string;

  /* 1 parent, or multiple: can be swapped later in relation to post.schema.ts
   * parent: Post + parentId: Post.id (aka number)?
   * or: parent => number || parent => post || parentId => number
   */
  @Field(() => Post)
  parent: Post;
}
