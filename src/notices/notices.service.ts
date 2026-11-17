import {
  Like,
  Repository,
} from 'typeorm';

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateNoticeDto } from './dto/create-notice.dto.js';
import { QueryNoticeDto } from './dto/query-notice.dto.js';
import { UpdateNoticeDto } from './dto/update-notice.dto.js';
import { Notice } from './entities/notice.entity.js';

@Injectable()
export class NoticesService {
  constructor(
    @InjectRepository(Notice) private readonly noticeRepo: Repository<Notice>,
  ) {}

  async findAll(query: QueryNoticeDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where = query.keyword
      ? [{ title: Like(`%${query.keyword}%`) }, { content: Like(`%${query.keyword}%`) }]
      : undefined;

    const [list, total] = await this.noticeRepo.findAndCount({
      where,
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      order: { id: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total, page, pageSize };
  }

  async findOne(id: number) {
    const notice = await this.noticeRepo.findOne({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!notice) {
      throw new NotFoundException('公告不存在');
    }
    return notice;
  }

  async create(dto: CreateNoticeDto) {
    const notice = this.noticeRepo.create({
      title: dto.title,
      content: dto.content,
      status: dto.status ?? 1,
    });
    await this.noticeRepo.save(notice);
    return this.findOne(notice.id);
  }

  async update(id: number, dto: UpdateNoticeDto) {
    const notice = await this.noticeRepo.findOne({ where: { id } });
    if (!notice) {
      throw new NotFoundException('公告不存在');
    }
    if (dto.title !== undefined) {
      notice.title = dto.title;
    }
    if (dto.content !== undefined) {
      notice.content = dto.content;
    }
    if (dto.status !== undefined) {
      notice.status = dto.status;
    }
    await this.noticeRepo.save(notice);
    return this.findOne(id);
  }

  async remove(id: number) {
    const notice = await this.noticeRepo.findOne({ where: { id } });
    if (!notice) {
      throw new NotFoundException('公告不存在');
    }
    await this.noticeRepo.remove(notice);
    return { success: true };
  }
}
