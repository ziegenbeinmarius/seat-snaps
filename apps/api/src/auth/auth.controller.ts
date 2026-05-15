import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Get,
  Param,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { ValidateDto } from "./dto/validate.dto";
import { Public } from "./decorators/public.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ short: { ttl: 60_000, limit: 5 }, long: { ttl: 600_000, limit: 20 } })
  @Get("users/:id/exists")
  async userExists(@Param("id") id: string) {
    return { exists: await this.authService.userExists(id) };
  }

  @Public()
  @Throttle({ short: { ttl: 60_000, limit: 3 }, long: { ttl: 600_000, limit: 10 } })
  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ short: { ttl: 60_000, limit: 5 }, long: { ttl: 600_000, limit: 20 } })
  @Post("validate")
  @HttpCode(HttpStatus.OK)
  async validate(@Body() dto: ValidateDto) {
    const user = await this.authService.validateCredentials(dto.email, dto.password);
    if (!user) throw new UnauthorizedException("Invalid credentials");
    return user;
  }
}
