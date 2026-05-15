import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, HealthCheckResult } from "@nestjs/terminus";
import { Public } from "../auth/decorators/public.decorator";

@Controller("health")
@Public()
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }
}
