import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'User không đc để trống' })
  email: string;
  @IsNotEmpty({ message: 'Mật khẩu không đc để trống' })
  password: string;
  @IsOptional()
  name: string;
}

export class CodeAuthDto {
  @IsNotEmpty({ message: 'id không đc để trống' })
  id: string;
  @IsNotEmpty({ message: 'Code không đc để trống' })
  code: string;
}
