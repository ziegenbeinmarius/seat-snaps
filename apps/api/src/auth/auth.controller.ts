import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { ValidateDto } from "./dto/validate.dto";
import { Public } from "./decorators/public.decorator";

@Controller("auth")
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("validate")
  @HttpCode(HttpStatus.OK)
  async validate(@Body() dto: ValidateDto) {
    const user = await this.authService.validateCredentials(dto.email, dto.password);
    if (!user) throw new UnauthorizedException("Invalid credentials");
    return user;
  }
}
