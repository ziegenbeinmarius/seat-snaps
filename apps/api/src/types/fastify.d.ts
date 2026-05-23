import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    cookies: { [cookieName: string]: string | undefined };
  }

  interface FastifyReply {
    setCookie(
      name: string,
      value: string,
      options?: {
        domain?: string;
        expires?: Date;
        httpOnly?: boolean;
        maxAge?: number;
        path?: string;
        sameSite?: "strict" | "lax" | "none" | boolean;
        secure?: boolean;
        signed?: boolean;
      },
    ): FastifyReply;

    clearCookie(
      name: string,
      options?: {
        domain?: string;
        path?: string;
        secure?: boolean;
        sameSite?: "strict" | "lax" | "none" | boolean;
      },
    ): FastifyReply;
  }
}
