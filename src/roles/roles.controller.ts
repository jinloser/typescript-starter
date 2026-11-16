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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator.js';
import { RolesService } from './roles.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { AssignMenusDto, QueryRoleDto } from './dto/query-role.dto.js';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('options')
  @ApiOperation({ summary: '角色选项（全量，用于分配下拉）' })
  options() {
    return this.rolesService.findAllOptions();
  }

  @Get()
  @RequirePermissions('sys:role:query')
  @ApiOperation({ summary: '分页查询角色' })
  findAll(@Query() query: QueryRoleDto) {
    return this.rolesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('sys:role:query')
  @ApiOperation({ summary: '查询角色详情（含菜单）' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @RequirePermissions('sys:role:add')
  @ApiOperation({ summary: '新增角色' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('sys:role:edit')
  @ApiOperation({ summary: '编辑角色' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('sys:role:delete')
  @ApiOperation({ summary: '删除角色' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }

  @Put(':id/menus')
  @RequirePermissions('sys:role:assign')
  @ApiOperation({ summary: '分配菜单权限' })
  assignMenus(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignMenusDto) {
    return this.rolesService.assignMenus(id, dto);
  }
}
