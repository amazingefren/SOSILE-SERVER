import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { UserModule } from './user/user.module';

import configuration from './config/configuration';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: require('path').join(process.cwd(), 'src/schema.gql'),
      debug: true,
      playground: false
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
