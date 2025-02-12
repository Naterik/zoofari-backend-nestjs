import { IsNotEmpty, IsEmail, IsOptional, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;

  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  address: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phone: string;

  @IsOptional()
  gender?: string;

  @IsOptional()
  dateOfBirth?: Date;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  role: number;
}
