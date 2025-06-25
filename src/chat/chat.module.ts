import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { DatabaseModule } from '@/database/database.module';
import { UserService } from '@/user/user.service';

import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [DatabaseModule, JwtModule],
  providers: [ChatGateway, UserService, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
