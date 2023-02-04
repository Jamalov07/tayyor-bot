import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Pupil } from '../pupil/pupil.model';
import { PupilModule } from '../pupil/pupil.module';
import { User } from '../users/users.model';
import { UsersModule } from '../users/users.module';
import { Group } from './group.model';
import { GroupService } from './group.service';
import { GroupUpdate } from './group.update';

@Module({
  imports: [
    SequelizeModule.forFeature([Group, User, Pupil]),
    forwardRef(() => UsersModule),
    forwardRef(() => PupilModule),
  ],
  providers: [GroupUpdate, GroupService],
  exports: [GroupService],
})
export class GroupModule {}
