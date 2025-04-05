import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
} from "class-validator";

export class CreateTicketDto {
  @IsEnum([
    "Adult",
    "Child",
    "Senior",
    "Student",
    "Group",
    "Annual Pass",
    "Family Pass",
  ])
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsOptional()
  description?: string;
}
