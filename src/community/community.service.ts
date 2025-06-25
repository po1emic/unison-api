import { Injectable } from '@nestjs/common';
import { Community, Prisma } from 'prisma/client';

import { DatabaseService } from '@/database/database.service';

import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';

@Injectable()
export class CommunityService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateCommunityDto) {
    const community = await this.db.community.create({ data: dto });
    const conference = await this.db.channel.create({
      data: {
        userId: dto.ownerId,
        communityId: community.id,
        name: 'Голосовой канал',
        type: 'CONFERENCE',
      },
    });
    const chat = await this.db.channel.create({
      data: {
        userId: dto.ownerId,
        communityId: community.id,
        name: 'Текстовый канал',
        type: 'CHAT',
      },
    });

    return {
      ...community,
      channels: [conference, chat],
    };
  }

  findMany(params?: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CommunityWhereUniqueInput;
    where?: Prisma.CommunityWhereInput;
    orderBy?: Prisma.CommunityOrderByWithRelationInput;
  }): Promise<Community[]> {
    return this.db.community.findMany(params);
  }

  async findOne(
    where: Prisma.CommunityWhereUniqueInput,
  ): Promise<Community | null> {
    return await this.db.community.findUnique({ where });
  }

  update(id: string, dto: UpdateCommunityDto) {
    return this.db.community.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.db.community.delete({ where: { id } });
  }
}
