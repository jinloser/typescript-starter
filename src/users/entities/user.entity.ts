import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 100, select: false })
  password: string;

  @Column({ type: 'varchar', length: 50, default: '' })
  nickname: string;

  @Column({ type: 'varchar', length: 100, default: '', nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, default: '', nullable: true })
  phone: string;

  @Column({ type: 'tinyint', default: 1, comment: '1 启用 0 禁用' })
  status: number;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
