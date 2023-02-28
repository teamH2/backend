import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { winstonLogger } from './common/winston.util';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import * as expressBasicAuth from 'express-basic-auth';

export const logger = new Logger('HTTP');

async function bootstrap() {
  // console.log(`mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CONTAINER}:${process.env.MONGO_PORT}`)
  const app = await NestFactory.create(AppModule,{
    logger: winstonLogger
  });
  app.use(cookieParser());
  app.enableCors({
    origin: true, 
    credentials: true,
    preflightContinue: false,
  });
  app.use(
    ['/api/docs'],
    expressBasicAuth({
      challenge: true,
      users: { [process.env.SWAGGER_USER]: process.env.SWAGGER_PWD },
    }),
  );

  const config = new DocumentBuilder()
  .setTitle('빵자국 API ')
  .setDescription('빵자국 api 입니다!')
  .setVersion('1.0')
  // .addTag('')
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  app.useGlobalPipes(new ValidationPipe());
  // app.use(
  //   session({
  //   secret: process.env.SESSION_SECRET,
  //   resave: false,
  //   saveUninitialized: false,
  //   cookie: {
  //     httpOnly: true,
  //     secure: false,
  //     maxAge : 1000 * 60 * 60 * 24 * 7,
  //   },
  // }));
  // app.use(passport.initialize());
  // app.use(passport.session());
  console.log('Listening on port 8080...')
  await app.listen(8080);
}
bootstrap();