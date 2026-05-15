import { Controller, Get, Put, Body, Param } from "@nestjs/common";
import { ThemesService } from "./themes.service";
import { UpdateThemeDto } from "./dto/update-theme.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Public } from "../auth/decorators/public.decorator";
import type { SessionUser } from "@seat-snaps/shared";

@Controller("events/:eventId/theme")
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Public()
  @Get()
  getTheme(@Param("eventId") eventId: string) {
    return this.themesService.getTheme(eventId);
  }

  @Put()
  updateTheme(
    @Param("eventId") eventId: string,
    @Body() dto: UpdateThemeDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.themesService.updateTheme(eventId, dto as never, user.id);
  }
}
