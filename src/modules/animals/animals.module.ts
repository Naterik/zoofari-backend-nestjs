import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnimalsService } from "./animals.service";
import { AnimalsController } from "./animals.controller";
import { Animal } from "./entities/animal.entity";
import { Species } from "../species/entities/species.entity";
import { Enclosure } from "../enclosures/entities/enclosure.entity";

import { ImagesModule } from "../images/images.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Animal, Species, Enclosure]),
    ImagesModule, // Import ImagesModule
  ],
  controllers: [AnimalsController],
  providers: [AnimalsService],
})
export class AnimalsModule {}
