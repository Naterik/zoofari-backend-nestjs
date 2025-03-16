import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";
import { OmitType } from "@nestjs/mapped-types";
import { IsEnum, IsOptional, IsString, Matches } from "class-validator";

export class UpdateUserDto extends OmitType(CreateUserDto, [
  "password",
  "email",
] as const) {}
export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: "Tên phải là chuỗi" })
  name?: string;

  @IsOptional()
  @IsString({ message: "Địa chỉ phải là chuỗi" })
  address?: string;

  @IsOptional()
  @Matches(/^\d{10}$/, { message: "Số điện thoại phải là 10 chữ số" })
  phone?: string;

  @IsOptional()
  @IsEnum(["Male", "Female", "Other"], { message: "Giới tính không hợp lệ" })
  gender?: string;

  @IsOptional()
  dateOfBirth?: Date;
}
