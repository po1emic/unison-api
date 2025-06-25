import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post()
  create(@Body() dto: CreateChannelDto) {
    return this.channelService.create(dto);
  }

  @Get()
  findAll() {
    return this.channelService.findMany();
  }

  @Get()
  findByCommunity(@Query('communityId') communityId: string) {
    return this.channelService.findMany({ where: { communityId } });
  }

  @Get(':channelId')
  async findOne(@Param('channelId') channelId: string) {
    const channel = await this.channelService.findOne(channelId);
    if (!channel) throw new NotFoundException('Такого канала не существует');

    return channel;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChannelDto) {
    return this.channelService.update(id, dto);
  }

  @Delete()
  remove(@Body('id') id: string) {
    return this.channelService.remove(id);
  }
}
