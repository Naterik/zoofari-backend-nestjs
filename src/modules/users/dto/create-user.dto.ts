import { IsNotEmpty, IsEmail, IsOptional, IsNumber } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({ message: "Tên không được để trống" })
  name: string;

  @IsNotEmpty({ message: "Email không được để trống" })
  @IsEmail({}, { message: "Email không hợp lệ" })
  email: string;

  @IsNotEmpty({ message: "Password không được để trống" })
  password: string;

  @IsOptional()
  address: string;

  @IsOptional()
  phone: string;

  @IsOptional()
  gender?: string;

  @IsOptional()
  dateOfBirth?: Date;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  role: number;
  @IsOptional()
  codeExpired: Date;
}
