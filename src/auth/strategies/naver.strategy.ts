import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { logger } from "src/main";
import { AuthService } from "../auth.service";

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver'){
    constructor(
        private readonly authService: AuthService,
    ){
        super({
            usernameField: 'access_token',
            passwordField: 'password',
        });
    }
    async validate(access_token: string, refresh_token: string, done: any){
        try{
            const user = await this.authService.getNaverPayload(access_token);
            return  done(null, user);
        }catch(err){
            logger.error(err);
            return  done(null, false);
        }
    }
}