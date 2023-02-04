import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../users/users.model';

interface PupilAttrs {
  student_id?: number;
  key_for_connect?: string;
  is_ready?: boolean;
}

@Table({ tableName: 'pupil' })
export class Pupil extends Model<Pupil, PupilAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.BIGINT, allowNull: false })
  student_id: number;

  @Column({ type: DataType.STRING })
  key_for_connect: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_ready: boolean;
}
