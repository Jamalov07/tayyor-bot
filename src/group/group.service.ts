import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Context } from 'telegraf';
import { Pupil } from '../pupil/pupil.model';
import { User } from '../users/users.model';
import { Group } from './group.model';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group) private readonly groupRepo: typeof Group,
    @InjectModel(User) private readonly userRepo: typeof User,
    @InjectModel(Pupil) private readonly pupilRepo: typeof Pupil,
  ) {}

  async start(ctx: Context) {
    await ctx.reply(`Salom ${ctx.from.first_name}`);
  }
}
