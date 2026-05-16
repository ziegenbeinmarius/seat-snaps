import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { TablesService } from "./tables.service";
import { CreateTableDto } from "./dto/create-table.dto";
import { UpdateTableDto } from "./dto/update-table.dto";
import { BulkUpdatePositionsDto } from "./dto/bulk-update-positions.dto";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { Public } from "../auth/decorators/public.decorator";
import { EventMemberGuard } from "../auth/guards/event-member.guard";

@UseGuards(EventMemberGuard)
@Controller("events/:eventId/tables")
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Public()
  @Get("public")
  listPublic(@Param("eventId") eventId: string) {
    return this.tablesService.listPublic(eventId);
  }

  @Get()
  list(@Param("eventId") eventId: string, @Query() query: PaginationQueryDto) {
    return this.tablesService.listForEventPaginated(eventId, query.page!, query.limit!);
  }

  @Patch("positions")
  @HttpCode(HttpStatus.NO_CONTENT)
  bulkUpdatePositions(
    @Param("eventId") eventId: string,
    @Body() dto: BulkUpdatePositionsDto,
  ) {
    return this.tablesService.bulkUpdatePositions(eventId, dto.positions);
  }

  @Post()
  create(
    @Param("eventId") eventId: string,
    @Body() dto: CreateTableDto,
  ) {
    return this.tablesService.create(eventId, dto);
  }

  @Get(":tableId")
  getOne(
    @Param("eventId") eventId: string,
    @Param("tableId") tableId: string,
  ) {
    return this.tablesService.getById(tableId, eventId);
  }

  @Patch(":tableId")
  update(
    @Param("eventId") eventId: string,
    @Param("tableId") tableId: string,
    @Body() dto: UpdateTableDto,
  ) {
    return this.tablesService.update(tableId, eventId, dto);
  }

  @Delete(":tableId")
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param("eventId") eventId: string,
    @Param("tableId") tableId: string,
  ) {
    return this.tablesService.delete(tableId, eventId);
  }
}
