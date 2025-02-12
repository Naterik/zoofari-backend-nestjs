import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAuthDto {

  @IsNotEmpty({ message: 'Email không đc để trống' })
  email: string;
  @IsNotEmpty({ message: 'Mật khẩu không đc để trống' })
  password: string;
  @IsOptional()
  name: string;
}
