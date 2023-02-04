import { InjectModel } from '@nestjs/sequelize';
import { Action, Ctx, Hears, Help, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { AppService } from './app.service';
import { User } from './users/users.model';

@Update()
export class AppUpdate {
  constructor(private readonly appService: AppService) {}
  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.appService.hello(ctx);
  }
  @On('contact')
  async onContact(@Ctx() ctx: Context) {
    await this.appService.OnContact(ctx);
  }

  @Hears('Guruh ochish 👥')
  async hearsGuruhOchish(@Ctx() ctx: Context) {
    await this.appService.hearsGuruhOchish(ctx);
  }

  @Hears('Tasodifiy guruh nomi 🎲')
  async hearsTasodifiyNom(@Ctx() ctx: Context) {
    await this.appService.hearsGenerateGroupName(ctx);
  }

  @Action('endthisgroup')
  async hearsEndGroup(@Ctx() ctx: Context) {
    await this.appService.hearsEndGroup(ctx);
  }

  @Action('updatepupilsready')
  async hearsTeacherForUpdate(@Ctx() ctx: Context) {
    await this.appService.hearsTeacherUpdatePupilsIsReady(ctx);
  }

  @Hears('Orqaga 🔙')
  async toBack(@Ctx() ctx: Context) {
    await this.appService.hearsOrqaga(ctx);
  }

  @Hears('Guruhga kirish 👤')
  async hearsGuruhgaKirish(@Ctx() ctx: Context) {
    await this.appService.hearsGuruhgaKirish(ctx);
  }

  @Action('exitingroup')
  async exitInGroup(@Ctx() ctx: Context) {
    await this.appService.exitInGroup(ctx);
  }

  @Action('iready')
  async iready(@Ctx() ctx: Context) {
    await this.appService.iReady(ctx);
  }

  @On('message')
  async onMessage(ctx: Context) {
    await this.appService.hearsIfOnMessage(ctx);
  }

  @Action('notready')
  async notReady(@Ctx() ctx: Context) {
    await this.appService.notReady(ctx);
  }
  // @Action('updatepupilsisready')
  // async hearsTeacherForUpdat(@Ctx() ctx: Context) {
  //   await this.appService.hearsTeacherUpdatePupilsIsReady(ctx);
  // }

  // @Help()
  // async help(@Ctx() ctx: Context) {
  //   await ctx.reply('Send me a sticker');
  // }

  // @On('sticker')
  // async on(@Ctx() ctx: Context) {
  //   await ctx.reply('👍');
  // }

  // @Hears(['hi', 'hello', 'hey'])
  // async hears(@Ctx() ctx: Context) {
  //   await ctx.reply('Hey there');
  // }
}
