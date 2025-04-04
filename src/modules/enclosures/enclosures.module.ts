import { Module } from "@nestjs/common";
import { EnclosuresService } from "./enclosures.service";
import { EnclosuresController } from "./enclosures.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Enclosure } from "./entities/enclosure.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Enclosure])],
  controllers: [EnclosuresController],
  providers: [EnclosuresService],
})
export class EnclosuresModule {}
