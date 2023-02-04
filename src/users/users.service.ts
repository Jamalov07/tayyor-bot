import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Group } from '../group/group.model';
import { Pupil } from '../pupil/pupil.model';
import { User } from './users.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly userRepo: typeof User,
    @InjectModel(Group) private readonly groupRepo: typeof Group,
    @InjectModel(Pupil) private readonly pupilRepo: typeof Pupil,
  ) {}
}
