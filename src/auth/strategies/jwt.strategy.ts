import { ConsoleLogger, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from 'express';
import axios from "axios";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";
import { AuthService } from "../auth.service";


const jwt_name = process.env.JWT_NAME;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt'){
    constructor(
        private readonly authService: AuthService,
        private readonly uersService: UsersService,
    ){
        super({
            secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
            jwtFromRequest: ExtractJwt.fromExtractors(
                [JwtStrategy.cookieExtractor,
                ExtractJwt.fromAuthHeaderAsBearerToken()
            ]),
            ignoreExpiration: false,            
        });
    }
    private static cookieExtractor(req:Request) :string|null {
        const jwt_name = process.env.JWT_NAME;
        if(req.cookies && jwt_name in req.cookies && req.cookies[jwt_name] !== ''){
            return req.cookies[jwt_name];
        }
        return null
    }

    async validate(payload) {
        const { _id } = payload;
        try{
            const user = await this.uersService.findUserById(_id);
            if(!user){
                throw new UnauthorizedException("user not found");
            }
            return payload;
        }catch(err){
            throw new UnauthorizedException("user not found");
        }
    }


}