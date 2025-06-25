import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { DatabaseService } from '@/database/database.service';
import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async getMessages(
    @Query('channelId', ParseUUIDPipe) channelId: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take: number,
  ) {
    return this.db.message.findMany({
      where: { channelId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }
}
