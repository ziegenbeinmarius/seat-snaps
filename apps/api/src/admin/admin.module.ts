import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { AdminGuard } from "./guards/admin.guard";
import { ADMIN_SERVICE } from "./domain/IAdminService";

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminGuard,
    {
      provide: ADMIN_SERVICE,
      useClass: AdminService,
    },
  ],
  exports: [AdminService],
})
export class AdminModule {}
