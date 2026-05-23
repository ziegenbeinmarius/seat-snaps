import { Injectable, type NestInterceptor, type ExecutionContext, type CallHandler } from "@nestjs/common";
import { type Observable, tap } from "rxjs";
import type { FastifyRequest } from "fastify";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const start = performance.now();

    return next.handle().pipe(
      tap(() => {
        const ms = (performance.now() - start).toFixed(1);
        console.log(`[api] ${req.method} ${req.url} — ${ms}ms`);
      }),
    );
  }
}
