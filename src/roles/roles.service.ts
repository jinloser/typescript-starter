import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Role } from './entities/role.entity.js';
import { Menu } from '../menus/entities/menu.entity.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { AssignMenusDto, QueryRoleDto } from './dto/query-role.dto.js';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Menu) private readonly menuRepo: Repository<Menu>,
  ) {}

  async findAll(query: QueryRoleDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where = query.keyword
      ? [{ name: Like(`%${query.keyword}%`) }, { code: Like(`%${query.keyword}%`) }]
      : undefined;

    const [list, total] = await this.roleRepo.findAndCount({
      where,
      order: { id: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total, page, pageSize };
  }

  async findAllOptions() {
    return this.roleRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: { menus: true },
    });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    return role;
  }

  async create(dto: CreateRoleDto) {
    const exists = await this.roleRepo.findOne({ where: { code: dto.code } });
    if (exists) {
      throw new BadRequestException('角色编码已存在');
    }
    const role = this.roleRepo.create({
      name: dto.name,
      code: dto.code,
      description: dto.description ?? '',
      status: dto.status ?? 1,
    });
    await this.roleRepo.save(role);
    return this.findOne(role.id);
  }

  async update(id: number, dto: UpdateRoleDto) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    if (dto.code && dto.code !== role.code) {
      const exists = await this.roleRepo.findOne({ where: { code: dto.code } });
      if (exists) {
        throw new BadRequestException('角色编码已存在');
      }
      role.code = dto.code;
    }
    if (dto.name !== undefined) {
      role.name = dto.name;
    }
    if (dto.description !== undefined) {
      role.description = dto.description;
    }
    if (dto.status !== undefined) {
      role.status = dto.status;
    }
    await this.roleRepo.save(role);
    return this.findOne(id);
  }

  async remove(id: number) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    if (['super_admin', 'admin'].includes(role.code)) {
      throw new BadRequestException('内置角色不允许删除');
    }
    await this.roleRepo.remove(role);
    return { success: true };
  }

  async assignMenus(id: number, dto: AssignMenusDto) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    const menus = dto.menuIds.length ? await this.menuRepo.findBy({ id: In(dto.menuIds) }) : [];
    role.menus = menus;
    await this.roleRepo.save(role);
    return this.findOne(id);
  }
}
