import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { FastifyRequest, FastifyReply } from "fastify";

@Injectable()
export class FastifyThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: Parameters<ThrottlerGuard["getRequestResponse"]>[0]) {
    const http = context.switchToHttp();
    return {
      req: http.getRequest<FastifyRequest>(),
      res: http.getResponse<FastifyReply>(),
    };
  }

  protected getTracker(req: FastifyRequest): Promise<string> {
    return Promise.resolve(req.ip);
  }
}
