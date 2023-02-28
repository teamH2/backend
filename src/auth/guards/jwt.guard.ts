import { Injectable } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common/exceptions";
import { ExecutionContext } from "@nestjs/common/interfaces";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const jwt_name = process.env.JWT_NAME
        const request= context.switchToHttp().getRequest();
        const cookie = request.cookies[jwt_name];
        if (cookie) {
            return true;
        }
        else{
            throw new UnauthorizedException('jwt cookie not found');
        }
        return super.canActivate(context);  
    }

    handleRequest(err, user, info, context) {
        if (err || !user) {
          throw err || new UnauthorizedException();
        }
        return user;
    }
}
