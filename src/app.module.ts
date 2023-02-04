import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TelegrafModule } from 'nestjs-telegraf';
import { AppUpdate } from './app.update';
import { UsersModule } from './users/users.module';
import { GroupModule } from './group/group.module';
import { PupilModule } from './pupil/pupil.module';
import { User } from './users/users.model';
import { Group } from './group/group.model';
import { Pupil } from './pupil/pupil.model';
import { AppService } from './app.service';
import { Member } from './members.model';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: '5915186714:AAEWaSZ_ny-mLUrA8DJ__BXRsqnc-ccwn8c',
    }),
    UsersModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: String(process.env.POSTGRES_PASSWORD),
      database: process.env.POSTGRES_DB,
      models: [User, Group, Pupil, Member],
      autoLoadModels: true,
      logging: false,
    }),
    SequelizeModule.forFeature([User, Group, Pupil, Member]),
    GroupModule,
    PupilModule,
  ],
  providers: [AppUpdate, AppService],
})
export class AppModule {}
