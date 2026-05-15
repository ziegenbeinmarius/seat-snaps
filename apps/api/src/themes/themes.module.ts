import { Module } from "@nestjs/common";
import { ThemesService } from "./themes.service";
import { ThemesController } from "./themes.controller";
import { THEME_SERVICE } from "./domain/IThemeService";

@Module({
  controllers: [ThemesController],
  providers: [
    ThemesService,
    {
      provide: THEME_SERVICE,
      useClass: ThemesService,
    },
  ],
  exports: [THEME_SERVICE],
})
export class ThemesModule {}
