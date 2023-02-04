import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Group } from '../group/group.model';
import { GroupModule } from '../group/group.module';
import { User } from '../users/users.model';
import { UsersModule } from '../users/users.module';
import { Pupil } from './pupil.model';
import { PupilService } from './pupil.service';
import { PupilUpdate } from './pupil.update';

@Module({
  imports: [
    SequelizeModule.forFeature([Pupil, User, Group]),
    forwardRef(() => GroupModule),
    forwardRef(() => UsersModule),
  ],
  providers: [PupilUpdate, PupilService],
  exports: [PupilService],
})
export class PupilModule {}
