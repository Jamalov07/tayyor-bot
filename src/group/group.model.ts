import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.model';

interface GroupAttrs {
  group_name?: string;
  teacher_id?: number;
  secret_key?: string;
}

@Table({ tableName: 'group' })
export class Group extends Model<Group, GroupAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, unique: true })
  group_name: string;

  @Column({ type: DataType.BIGINT })
  teacher_id: number;

  @Column({ type: DataType.STRING })
  secret_key: string;
}
