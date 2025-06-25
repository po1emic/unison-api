import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { ChatModule } from './chat/chat.module';
import { CommunityModule } from './community/community.module';
import { DatabaseModule } from './database/database.module';
import { MessageModule } from './message/message.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    CommunityModule,
    ChannelModule,
    ChatModule,
    MessageModule,
  ],
})
export class AppModule {}
