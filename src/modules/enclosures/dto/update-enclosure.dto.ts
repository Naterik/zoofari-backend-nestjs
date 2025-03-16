import { PartialType } from '@nestjs/mapped-types';
import { CreateEnclosureDto } from './create-enclosure.dto';

export class UpdateEnclosureDto extends PartialType(CreateEnclosureDto) {}
