import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  import { BakeriesService } from '../../bakeries/bakeries.service';
@Injectable()
export class IsUserReviedBakeryInterceptor implements NestInterceptor {

  constructor(
    private readonly bakeryService: BakeriesService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const review = request.body;
    // const 
    return next.handle().pipe();
  }
}