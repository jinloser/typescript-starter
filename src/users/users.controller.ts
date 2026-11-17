import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
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
import { AssignRolesDto } from './dto/assign-roles.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { QueryUserDto } from './dto/query-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('sys:user:query')
  @ApiOperation({ summary: '分页查询用户' })
  findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('sys:user:query')
  @ApiOperation({ summary: '查询用户详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @RequirePermissions('sys:user:add')
  @ApiOperation({ summary: '新增用户' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('sys:user:edit')
  @ApiOperation({ summary: '编辑用户' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('sys:user:delete')
  @ApiOperation({ summary: '删除用户' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Put(':id/roles')
  @RequirePermissions('sys:user:assign')
  @ApiOperation({ summary: '分配角色' })
  assignRoles(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignRolesDto) {
    return this.usersService.assignRoles(id, dto);
  }
}
