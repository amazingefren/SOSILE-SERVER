import * as graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';
import { createParamDecorator } from '@nestjs/common';

/**
 * @decorator Fields
 * @param match IncludeOpts (class)
 * @returns Object with fields for that were requested in graphql
 * @example parents: true, history: true (todo)
 */
export const Fields = createParamDecorator((match, context) => {
  const gqlInfo: GraphQLResolveInfo = context.args[3];
  const fields = Object.keys(graphqlFields(gqlInfo));
  const compare = Object.keys(new match());
  let result = {};
  for (let i = 0; i < fields.length; i++) {
    if (compare.includes(fields[i])) {
      result[fields[i]] = true;
    }
  }
  return Object.keys(result).length != 0 ? result : new match();
});
