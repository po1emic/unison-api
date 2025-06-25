import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/database/database.module';

import { MessageController } from './message.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [MessageController],
})
export class MessageModule {}
