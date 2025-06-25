/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { DatabaseService } from '@/database/database.service';
import { MessageDto } from './dto/message.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async verifyToken(token: string) {
    const payload = await this.jwtService.verify(token);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.db.user.findUnique({ where: { id: payload.sub } });
  }

  async validateChannelAccess(userId: string, channelId: string) {
    const channel = await this.db.channel.findUnique({
      where: { id: channelId },
      include: { community: { include: { members: true } } },
    });

    if (!channel) throw new Error('Channel not found');

    const isMember = channel.community.members.some((m) => m.userId === userId);
    if (!isMember) throw new Error('Access denied');

    return true;
  }

  async createMessage(
    userId: string,
    dto: SendMessageDto,
  ): Promise<MessageDto> {
    const message = await this.db.message.create({
      data: {
        content: dto.content,
        userId: dto.userId,
        channelId: dto.channelId,
      },
      include: { author: true },
    });

    return message;
  }
}
