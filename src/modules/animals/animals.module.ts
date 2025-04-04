import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnimalsService } from "./animals.service";
import { AnimalsController } from "./animals.controller";
import { Animal } from "./entities/animal.entity";
import { Species } from "../species/entities/species.entity";
import { Enclosure } from "../enclosures/entities/enclosure.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Animal, Species, Enclosure])],
  controllers: [AnimalsController],
  providers: [AnimalsService],
  exports: [AnimalsService],
})
export class AnimalsModule {}
