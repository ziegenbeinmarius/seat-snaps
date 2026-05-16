import {
  Controller,
  Get,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminGuard } from "./guards/admin.guard";

@Controller("admin")
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("metrics")
  getMetrics() {
    return this.adminService.getMetrics();
  }

  @Get("users")
  getUsers() {
    return this.adminService.getUsers();
  }

  @Get("events")
  getEvents() {
    return this.adminService.getEvents();
  }

  @Delete("users/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  forceDeleteUser(@Param("id") id: string) {
    return this.adminService.forceDeleteUser(id);
  }

  @Delete("events/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  forceDeleteEvent(@Param("id") id: string) {
    return this.adminService.forceDeleteEvent(id);
  }
}
