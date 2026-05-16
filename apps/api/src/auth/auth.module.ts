import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AUTH_SERVICE } from "./domain/IAuthService";

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("app.authSecret"),
        signOptions: { algorithm: "HS256" as const, expiresIn: "30d" },
        verifyOptions: { algorithms: ["HS256" as const] },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: AUTH_SERVICE,
      useClass: AuthService,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
