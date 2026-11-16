import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity.js';
import { CreateMenuDto } from './dto/create-menu.dto.js';
import { UpdateMenuDto } from './dto/update-menu.dto.js';

export type MenuNode = Menu & {
  children?: MenuNode[];
};

@Injectable()
export class MenusService {
  constructor(@InjectRepository(Menu) private readonly menuRepo: Repository<Menu>) {}

  async tree() {
    const all = await this.menuRepo.find({ order: { sort: 'ASC', id: 'ASC' } });
    return this.buildTree(all);
  }

  async findOne(id: number) {
    const menu = await this.menuRepo.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    return menu;
  }

  async create(dto: CreateMenuDto) {
    if (dto.parentId && dto.parentId !== 0) {
      const parent = await this.menuRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) {
        throw new BadRequestException('父菜单不存在');
      }
    }
    const menu = this.menuRepo.create(dto as Partial<Menu>);
    await this.menuRepo.save(menu);
    return menu;
  }

  async update(id: number, dto: UpdateMenuDto) {
    const menu = await this.menuRepo.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    if (dto.parentId !== undefined && dto.parentId !== 0) {
      if (dto.parentId === id) {
        throw new BadRequestException('父菜单不能是自己');
      }
      const parent = await this.menuRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) {
        throw new BadRequestException('父菜单不存在');
      }
    }
    Object.assign(menu, dto);
    await this.menuRepo.save(menu);
    return menu;
  }

  async remove(id: number) {
    const menu = await this.menuRepo.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    const descendants = await this.collectDescendants(id);
    await this.menuRepo.remove(descendants);
    return { success: true };
  }

  private buildTree(all: Menu[]): MenuNode[] {
    const map = new Map<number, MenuNode>();
    for (const m of all) {
      map.set(m.id, { ...m, children: [] });
    }
    const roots: MenuNode[] = [];
    for (const node of map.values()) {
      if (node.parentId === 0) {
        roots.push(node);
      } else {
        const parent = map.get(node.parentId);
        if (parent) {
          parent.children?.push(node);
        } else {
          roots.push(node);
        }
      }
    }
    return roots;
  }

  private async collectDescendants(id: number): Promise<Menu[]> {
    const all = await this.menuRepo.find();
    const result: Menu[] = [];
    const walk = (parentId: number) => {
      for (const m of all) {
        if (m.parentId === parentId) {
          result.push(m);
          walk(m.id);
        }
      }
    };
    walk(id);
    return result;
  }
}
