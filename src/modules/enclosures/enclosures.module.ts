import { Module } from '@nestjs/common';
import { EnclosuresService } from './enclosures.service';
import { EnclosuresController } from './enclosures.controller';

@Module({
  controllers: [EnclosuresController],
  providers: [EnclosuresService],
})
export class EnclosuresModule {}
