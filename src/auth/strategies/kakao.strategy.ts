import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { logger } from "src/main";
import { AuthService } from "../auth.service";

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao'){
    constructor(
        private readonly authService: AuthService,
    ){
        super({
            usernameField: 'access_token',
            passwordField: 'refresh_token',
        });
    }
    async validate(access_token: string, refresh_token: string, done: any ){
        try{
            const user = await this.authService.getKakaoPayload(access_token);
            return  done(null, user);
        }catch(err){
            logger.error(err);
            return  done(null, false);
        }
    }
}