import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventsService } from "./events.service";
import { EventsController } from "./events.controller";
import { Event } from "./entities/event.entity";
import { Enclosure } from "../enclosures/entities/enclosure.entity";
import { News } from "../news/entities/news.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Event, Enclosure, News])],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
