import { IsNotEmpty, Length, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MaxLength(32)
  email: string;

  @Length(6, 128)
  password: string;
}
