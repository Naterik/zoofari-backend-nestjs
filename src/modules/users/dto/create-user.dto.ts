import {
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  Matches,
} from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({ message: "Tên không được để trống" })
  name: string;

  @IsNotEmpty({ message: "Email không được để trống" })
  @IsEmail({}, { message: "Email không hợp lệ" })
  email: string;

  @IsNotEmpty({ message: "Password không được để trống" })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ và số",
  })
  password: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  @Matches(/^\d{10}$/, { message: "Số điện thoại phải là 10 chữ số" })
  phone?: string;

  @IsOptional()
  gender?: "Male" | "Female" | "Other";

  @IsOptional()
  dateOfBirth?: Date;

  @IsOptional()
  @IsEnum([1, 2, 3], { message: "Vai trò không hợp lệ" })
  role?: number;
}
