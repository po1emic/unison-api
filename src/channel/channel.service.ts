import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '@/database/database.service';

import { Prisma } from 'prisma/client';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateChannelDto) {
    const community = await this.db.community.findUnique({
      where: { id: dto.communityId },
    });
    if (!community) {
      throw new NotFoundException('Такого сообщества не существует');
    }

    return await this.db.channel.create({ data: dto });
  }

  findMany(params?: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ChannelWhereUniqueInput;
    where?: Prisma.ChannelWhereInput;
    orderBy?: Prisma.ChannelOrderByWithRelationInput;
  }) {
    return this.db.channel.findMany(params);
  }

  findOne(id: string) {
    return this.db.channel.findUnique({ where: { id } });
  }

  async update(id: string, dto: UpdateChannelDto) {
    const channel = await this.db.channel.update({ where: { id }, data: dto });
    if (!channel) throw new NotFoundException('Такого канала не существует');

    return await this.db.channel.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const channel = await this.db.channel.findUnique({ where: { id } });
    if (!channel) {
      throw new NotFoundException('Такого канала не существует');
    }

    const sameTypeChannels = await this.db.channel.count({
      where: {
        communityId: channel.communityId,
        type: channel.type,
        id: { not: id },
      },
    });

    if (sameTypeChannels === 0) {
      const channelType = channel.type === 'CHAT' ? 'текстовый' : 'голосовой';

      throw new BadRequestException(
        `Нельзя удалить последний ${channelType} канал сообщества`,
      );
    }

    return this.db.channel.delete({ where: { id } });
  }
}
