import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Review, ReviewSchema } from 'src/bakeries/reviews.schema';
import { User, UserSchema } from 'src/users/user.schema';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { NaverStrategy } from './strategies/naver.strategy';
// import { SessionSerializer } from './session.serializer';
import { ConfigService } from '@nestjs/config';
import { JwtService,JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategey';

@Module({
  imports: [ MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    { name: Review.name, schema: ReviewSchema}
  ]),
  PassportModule.register({session:false}),
  JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { 
      expiresIn:process.env.JWT_DURATION 
    },
  }),
  UsersModule,
  ],
  controllers: [AuthController],
  providers: [ 
    AuthService, 
    ConfigService,
    GoogleStrategy, 
    JwtService,
    JwtAuthGuard,
    JwtStrategy,
    JwtRefreshGuard,
    JwtRefreshStrategy,
    KakaoStrategy, 
    NaverStrategy,
  ],
})
export class AuthModule {}
