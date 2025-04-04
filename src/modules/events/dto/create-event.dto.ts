import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
} from "class-validator";

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @IsEnum(["upcoming", "ongoing", "finished"])
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsNotEmpty()
  enclosure_id: number;

  @IsNumber()
  @IsOptional()
  news_id?: number;
}
