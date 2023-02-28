import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { logger } from 'src/main';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
  ) {
    super({
        usernameField: 'credential',
        passwordField: 'password',
    });
  }

  async validate(credential:string ,_, done: any,){
    try{
        const user = await this.authService.getGooglePayload(credential);
        return user;
    }catch(err){
        logger.error(err);
        return false;
    }
  }
}