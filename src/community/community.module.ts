import { Module } from '@nestjs/common';

import { ChannelModule } from '@/channel/channel.module';
import { DatabaseModule } from '@/database/database.module';

import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';

@Module({
  imports: [DatabaseModule, ChannelModule],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
