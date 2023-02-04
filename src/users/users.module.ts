import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Group } from '../group/group.model';
import { GroupModule } from '../group/group.module';
import { Pupil } from '../pupil/pupil.model';
import { PupilModule } from '../pupil/pupil.module';
import { User } from './users.model';
import { UsersService } from './users.service';
import { UsersUpdate } from './users.update';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Group, Pupil]),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    forwardRef(() => GroupModule),
    forwardRef(() => PupilModule),
  ],
  providers: [UsersUpdate, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
