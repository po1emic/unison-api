import { IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  channelId: string;

  @IsUUID()
  userId: string;

  @IsString()
  content: string;
}
