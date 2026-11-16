import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity.js';
import { MenusController } from './menus.controller.js';
import { MenusService } from './menus.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Menu])],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}
