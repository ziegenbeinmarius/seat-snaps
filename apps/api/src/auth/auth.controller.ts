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
import type { SessionUser } from "@seat-snaps/shared";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { ValidateDto } from "./dto/validate.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { Public } from "./decorators/public.decorator";
import { CurrentUser } from "./decorators/current-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get("users/:id/exists")
  async userExists(@Param("id") id: string) {
    return { exists: await this.authService.userExists(id) };
  }

  @Public()
  @Get("users/:id/token-version")
  async getTokenVersion(@Param("id") id: string) {
    const tokenVersion = await this.authService.getTokenVersion(id);
    if (tokenVersion === null) return { exists: false, tokenVersion: null };
    return { exists: true, tokenVersion };
  }

  @Public()
  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post("validate")
  @HttpCode(HttpStatus.OK)
  async validate(@Body() dto: ValidateDto) {
    const user = await this.authService.validateCredentials(dto.email, dto.password);
    if (!user) throw new UnauthorizedException("Invalid credentials");
    return user;
  }

  @Post("change-password")
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(@CurrentUser() user: SessionUser, @Body() dto: ChangePasswordDto) {
    await this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword);
  }
}
