import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';

@Catch(UnauthorizedException)
export class RefreshAuthFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse<Response>();
        const refreshToken = process.env.REFRESH_TOKEN_NAME
        if(request.cookies[refreshToken]){
            request.header['redirectedFrom'] = request.url;
            return response.redirect(HttpStatus.PERMANENT_REDIRECT, '/api/auth/refresh' );
        }else{
            return response
        }
    }
}