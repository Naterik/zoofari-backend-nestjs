import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { EventsService } from "./events.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { PaginateQuery, Paginated } from "nestjs-paginate";
import { Event } from "./entities/event.entity";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(
    @Body() createEventDto: CreateEventDto
  ): Promise<{ id: number; message: string }> {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll(@Query() query: PaginateQuery): Promise<Paginated<Event>> {
    return this.eventsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<Event> {
    return this.eventsService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateEventDto: UpdateEventDto
  ): Promise<{ message: string; event: Event }> {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(":id")
  remove(
    @Param("id") id: string
  ): Promise<{ message: string; affected: number }> {
    return this.eventsService.remove(+id);
  }
}
