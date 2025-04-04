import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
} from "class-validator";

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsEnum(["upcoming", "ongoing", "finished"])
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  enclosure_id?: number;

  @IsNumber()
  @IsOptional()
  news_id?: number;
}
