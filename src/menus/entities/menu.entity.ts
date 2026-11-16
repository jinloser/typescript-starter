import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity.js';

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number;

  @Column({ type: 'int', default: 0, name: 'parent_id', comment: '父菜单ID，0为根' })
  parentId: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 20, comment: 'dir|menu|button' })
  type: 'dir' | 'menu' | 'button';

  @Column({ type: 'varchar', length: 200, default: '' })
  path: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  component: string;

  @Column({ type: 'varchar', length: 100, default: '' })
  permission: string;

  @Column({ type: 'varchar', length: 50, default: '' })
  icon: string;

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ type: 'tinyint', default: 1, comment: '1 启用 0 禁用' })
  status: number;

  @ManyToMany(() => Role, (role) => role.menus)
  roles: Role[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
