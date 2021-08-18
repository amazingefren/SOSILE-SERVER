import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { FastifyRequest } from 'fastify';
import * as jwt from 'jsonwebtoken';

export const CurrentUser = createParamDecorator(
  (_, context: ExecutionContext) => {
    const { req }: { req: FastifyRequest } =
      GqlExecutionContext.create(context).getContext();
    return Number(jwt.decode(req.cookies.access_token).sub);
  },
);
