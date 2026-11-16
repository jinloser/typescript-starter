import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Menu } from '../../menus/entities/menu.entity.js';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  description: string;

  @Column({ type: 'tinyint', default: 1, comment: '1 启用 0 禁用' })
  status: number;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Menu, (menu) => menu.roles)
  @JoinTable({
    name: 'role_menus',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'menu_id', referencedColumnName: 'id' },
  })
  menus: Menu[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
