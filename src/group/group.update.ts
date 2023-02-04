import { Ctx, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { GroupService } from './group.service';
@Update()
export class GroupUpdate {
  constructor(private readonly groupService: GroupService) {}

  @Start()
  onStart(@Ctx() ctx: Context) {
    return this.groupService.start(ctx);
  }
}
