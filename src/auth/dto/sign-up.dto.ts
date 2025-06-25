import { IsNotEmpty, Length, MaxLength } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @MaxLength(32)
  email: string;

  @Length(6, 128)
  password: string;
}
