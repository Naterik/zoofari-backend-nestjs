import { IsString, IsOptional, IsNumber, IsEnum } from "class-validator";

export class UpdateTicketDto {
  @IsEnum([
    "Adult",
    "Child",
    "Senior",
    "Student",
    "Group",
    "Annual Pass",
    "Family Pass",
  ])
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
