import 'reflect-metadata';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsString, Length } from 'class-validator';
import { User } from '../user/user.model';

type Role = 'USER' | 'ADMIN';

@ObjectType()
export class AuthUser extends User {
  // Authorization
  @Field(() => String, { nullable: true })
  @IsString()
  role?: Role;
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
}

@InputType()
export class AuthLoginUserInput {
  @Field()
  @Length(1, 16)
  username: string;

  @Field()
  password: string;
}
