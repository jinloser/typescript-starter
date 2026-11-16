import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator.js';
import { MenusService } from './menus.service.js';
import { CreateMenuDto } from './dto/create-menu.dto.js';
import { UpdateMenuDto } from './dto/update-menu.dto.js';

@ApiTags('menus')
@ApiBearerAuth()
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get('tree')
  @RequirePermissions('sys:menu:query')
  @ApiOperation({ summary: '菜单树' })
  tree() {
    return this.menusService.tree();
  }

  @Post()
  @RequirePermissions('sys:menu:add')
  @ApiOperation({ summary: '新增菜单' })
  create(@Body() dto: CreateMenuDto) {
    return this.menusService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('sys:menu:edit')
  @ApiOperation({ summary: '编辑菜单' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMenuDto) {
    return this.menusService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('sys:menu:delete')
  @ApiOperation({ summary: '删除菜单（含子菜单）' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menusService.remove(id);
  }
}
