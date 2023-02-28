import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from "passport-jwt";
import { logger } from 'src/main';
import { AuthService } from '../auth.service';


@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly authService: AuthService,
  ) {
    super({
        secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET,
        jwtFromRequest: ExtractJwt.fromExtractors(
            [JwtRefreshStrategy.cookieExtractor,
            ExtractJwt.fromAuthHeaderAsBearerToken()
        ]),
        ignoreExpiration: false,         
        passReqToCallback: true,
    });
  }
  private static cookieExtractor(req:Request) :string|null {
      const REFRESH_TOKEN_NAME = process.env.REFRESH_TOKEN_NAME;
      if(req.cookies && REFRESH_TOKEN_NAME in req.cookies && req.cookies[REFRESH_TOKEN_NAME] !== ''){
        return req.cookies[REFRESH_TOKEN_NAME];
      }
        return null
    }

  async validate(req : any, payload: any) {
    const refreshTokenName = process.env.REFRESH_TOKEN_NAME;
    const userId = payload._id;
    const refreshToken = req.cookies?.[refreshTokenName];
    const result=await this.authService.getUserRefreshTokenMatches(refreshToken, userId);
    if(!result){
      throw new UnauthorizedException(`Refresh token authentication failed `);
    } 
    return payload;
  }
}