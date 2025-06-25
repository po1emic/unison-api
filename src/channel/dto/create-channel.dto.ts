import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { ChannelType } from 'prisma/client';

export class CreateChannelDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  communityId: string;

  @MaxLength(24)
  @IsNotEmpty()
  name: string;

  @IsString()
  type: ChannelType;
}
