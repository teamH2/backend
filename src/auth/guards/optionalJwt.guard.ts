import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const jwt_name = process.env.JWT_NAME
    const request= context.switchToHttp().getRequest();
    const cookie = request.cookies[jwt_name];
    if (cookie) {
        return super.canActivate(context); 
    }
    else{
        return true;
    }
  }
}