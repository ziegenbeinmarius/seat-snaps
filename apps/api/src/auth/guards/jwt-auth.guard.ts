import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import type { FastifyRequest } from "fastify";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest & { user?: unknown }>();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException();

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractToken(request: FastifyRequest): string | null {
    const cookieToken = this.extractAuthJsTokenFromCookies(request);
    if (cookieToken) return cookieToken;

    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.slice(7);
    }
    return null;
  }

  private extractAuthJsTokenFromCookies(request: FastifyRequest): string | null {
    const cookies = (request as FastifyRequest & { cookies?: Record<string, string> }).cookies;
    if (!cookies) return null;

    const baseNames = [
      "authjs.session-token",
      "__Secure-authjs.session-token",
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
    ];

    for (const baseName of baseNames) {
      const direct = cookies[baseName];
      if (direct) return direct;

      // NextAuth/Auth.js may chunk long cookie values as .0, .1, ...
      const chunks = Object.entries(cookies)
        .filter(([name]) => name.startsWith(`${baseName}.`))
        .map(([name, value]) => {
          const index = Number(name.slice(baseName.length + 1));
          return { index, value };
        })
        .filter((chunk) => Number.isInteger(chunk.index))
        .sort((a, b) => a.index - b.index)
        .map((chunk) => chunk.value);

      if (chunks.length > 0) return chunks.join("");
    }

    return null;
  }
}
