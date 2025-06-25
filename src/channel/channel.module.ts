import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/database/database.module';

import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ChannelController],
  providers: [ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
