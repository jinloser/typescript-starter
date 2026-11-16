import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Like, Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { User } from './entities/user.entity.js';
import { Role } from '../roles/entities/role.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { QueryUserDto } from './dto/query-user.dto.js';
import { AssignRolesDto } from './dto/assign-roles.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
  ) {}

  async findAll(query: QueryUserDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where = query.keyword
      ? [{ username: Like(`%${query.keyword}%`) }, { nickname: Like(`%${query.keyword}%`) }]
      : undefined;

    const [list, total] = await this.userRepo.findAndCount({
      where,
      relations: { roles: true },
      select: {
        id: true,
        username: true,
        nickname: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        roles: { id: true, name: true, code: true },
      },
      order: { id: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list, total, page, pageSize };
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: { roles: true },
      select: {
        id: true,
        username: true,
        nickname: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        roles: { id: true, name: true, code: true },
      },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async create(dto: CreateUserDto) {
    const exists = await this.userRepo.findOne({ where: { username: dto.username } });
    if (exists) {
      throw new BadRequestException('用户名已存在');
    }
    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      username: dto.username,
      password: hash,
      nickname: dto.nickname ?? '',
      email: dto.email ?? null,
      phone: dto.phone ?? null,
      status: dto.status ?? 1,
    } as DeepPartial<User>);
    await this.userRepo.save(user);
    return this.findOne(user.id);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (dto.username && dto.username !== user.username) {
      const exists = await this.userRepo.findOne({ where: { username: dto.username } });
      if (exists) {
        throw new BadRequestException('用户名已存在');
      }
      user.username = dto.username;
    }
    if (dto.nickname !== undefined) {
      user.nickname = dto.nickname;
    }
    if (dto.email !== undefined) {
      user.email = dto.email;
    }
    if (dto.phone !== undefined) {
      user.phone = dto.phone;
    }
    if (dto.status !== undefined) {
      user.status = dto.status;
    }
    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }
    await this.userRepo.save(user);
    return this.findOne(id);
  }

  async remove(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    await this.userRepo.remove(user);
    return { success: true };
  }

  async assignRoles(id: number, dto: AssignRolesDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    const roles = dto.roleIds.length
      ? await this.roleRepo.findBy({ id: In(dto.roleIds) })
      : [];
    user.roles = roles;
    await this.userRepo.save(user);
    return this.findOne(id);
  }
}
