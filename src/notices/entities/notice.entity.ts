import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notices')
export class Notice {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 200, comment: '公告标题' })
  title: string;

  @Column({ type: 'text', comment: '公告内容' })
  content: string;

  @Column({ type: 'tinyint', default: 1, comment: '1 启用 0 禁用' })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
