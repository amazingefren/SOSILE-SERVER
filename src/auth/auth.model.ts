import 'reflect-metadata';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsString, Length } from 'class-validator';
import { User } from '../user/user.model';

type Role = 'USER' | 'ADMIN';

@ObjectType()
export class AuthUser extends User {
  // Authorization
  @Field(() => String)
  @IsString()
  role?: Role;

  @Field(() => String)
  @IsString()
  token?: Role;
}

@ObjectType()
export class Test {
  @Field(() => String)
  token: string;
}

@InputType()
export class AuthRegisterUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Length(1, 16)
  username: string;

  @Field()
  password: string;

  @Field()
  displayName: string;
}

@InputType()
export class AuthLoginUserInput {
  @Field()
  @Length(1, 16)
  username: string;

  @Field()
  password: string;
}
