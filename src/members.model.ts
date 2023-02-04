import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface MemberAttrs {
  user_id: number;
  message_id: number;
}

@Table({ tableName: 'member' })
export class Member extends Model<Member, MemberAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.BIGINT })
  user_id: number;

  @Column({ type: DataType.INTEGER })
  message_id: number;
}
