import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Prisma, User } from 'prisma/client';

import { DatabaseService } from '@/database/database.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private db: DatabaseService) {}

  async findOne(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return await this.db.user.findUnique({ where });
  }

  findMany(params?: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    return this.db.user.findMany(params);
  }

  async create(dto: CreateUserDto): Promise<User> {
    const { email, password } = dto;
    const passwordHash = await argon2.hash(password);

    return await this.db.user.create({ data: { email, passwordHash } });
  }

  update(params: {
    data: UpdateUserDto;
    where: Prisma.UserWhereUniqueInput;
  }): Promise<User> {
    return this.db.user.update(params);
  }

  delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.db.user.delete({ where });
  }
}
