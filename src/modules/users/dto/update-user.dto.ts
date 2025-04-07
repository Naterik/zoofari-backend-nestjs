import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
} from "class-validator";
import { Gender } from "../entities/user.entity";

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  roleIds?: number[];

  @IsOptional()
  isActive?: boolean;
}
