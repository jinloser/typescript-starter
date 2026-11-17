import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  RequirePermissions,
} from '../common/decorators/require-permissions.decorator.js';
import { CreateNoticeDto } from './dto/create-notice.dto.js';
import { QueryNoticeDto } from './dto/query-notice.dto.js';
import { UpdateNoticeDto } from './dto/update-notice.dto.js';
import { NoticesService } from './notices.service.js';

@ApiTags('notices')
@ApiBearerAuth()
@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Get()
  @RequirePermissions('sys:notice:query')
  @ApiOperation({ summary: '分页查询公告' })
  findAll(@Query() query: QueryNoticeDto) {
    return this.noticesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('sys:notice:query')
  @ApiOperation({ summary: '查询公告详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.noticesService.findOne(id);
  }

  @Post()
  @RequirePermissions('sys:notice:add')
  @ApiOperation({ summary: '新增公告' })
  create(@Body() dto: CreateNoticeDto) {
    return this.noticesService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('sys:notice:edit')
  @ApiOperation({ summary: '编辑公告' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNoticeDto) {
    return this.noticesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('sys:notice:delete')
  @ApiOperation({ summary: '删除公告' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.noticesService.remove(id);
  }
}
