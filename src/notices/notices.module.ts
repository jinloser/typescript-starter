import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Notice } from '../notices/entities/notice.entity.js';
import { NoticesController } from '../notices/notices.controller.js';
import { NoticesService } from '../notices/notices.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Notice])],
  controllers: [NoticesController],
  providers: [NoticesService],
  exports: [NoticesService],
})
export class NoticesModule {}
