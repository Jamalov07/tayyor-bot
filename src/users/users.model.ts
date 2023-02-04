import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface UserAttrs {
  user_id: number;
  nickname?: string;
  username?: string;
  phone_number?: string;
}

@Table({ tableName: 'user' })
export class User extends Model<User, UserAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.BIGINT, unique: true })
  user_id: number;

  @Column({ type: DataType.STRING, unique: true })
  nickname: string;

  @Column({ type: DataType.STRING, unique: true })
  username: string;

  @Column({ type: DataType.STRING, unique: true })
  phone_number: string;
}
