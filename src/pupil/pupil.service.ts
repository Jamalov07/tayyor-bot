import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Group } from '../group/group.model';
import { User } from '../users/users.model';
import { Pupil } from './pupil.model';

@Injectable()
export class PupilService {
  constructor(
    @InjectModel(Pupil) private readonly pupilRepo: typeof Pupil,
    @InjectModel(Group) private readonly groupRepo: typeof Group,
    @InjectModel(User) private readonly userRepo: typeof User,
  ) {}
}
