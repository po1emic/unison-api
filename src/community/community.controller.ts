import { ChannelService } from '@/channel/channel.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';

@Controller('community')
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
    private readonly channelService: ChannelService,
  ) {}

  @Post()
  create(@Body() dto: CreateCommunityDto) {
    return this.communityService.create(dto);
  }

  @Get('public')
  findPublic() {
    return this.communityService.findMany({ where: { isPrivate: false } });
  }

  @Get(':communityId/channel')
  findChannels(@Param('communityId') communityId: string) {
    return this.channelService.findMany({ where: { communityId } });
  }

  @Get()
  findByOwner(@Query('ownerId') ownerId?: string) {
    return this.communityService.findMany({ where: { ownerId } });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communityService.findOne({ id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCommunityDto) {
    return this.communityService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communityService.remove(id);
  }
}
