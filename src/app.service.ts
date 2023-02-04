import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Context, Markup } from 'telegraf';
import { User } from './users/users.model';
import * as otpGe from 'otp-generator';
import { Group } from './group/group.model';
import { Pupil } from './pupil/pupil.model';
import { Member } from './members.model';
@Injectable()
export class AppService {
  constructor(
    @InjectModel(User) private readonly userRepo: typeof User,
    @InjectModel(Group) private readonly groupRepo: typeof Group,
    @InjectModel(Pupil) private readonly pupilRepo: typeof Pupil,
    @InjectModel(Member) private readonly memberRepo: typeof Member,
  ) {}

  async hello(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: ctx.from.id },
    });
    if (!user) {
      await ctx.reply(
        `Assalomu alaykum ${ctx.from.first_name}. \nDavom etish uchun <b>📱 Telefon raqamni yuborish</b> tugmasini bosing.`,
        {
          parse_mode: 'HTML',
          ...Markup.keyboard([
            Markup.button.contactRequest('📱 Telefon raqamni yuborish'),
          ])
            .oneTime()
            .resize(),
        },
      );
    } else {
      await this.kerakliBolimlar(ctx);
    }
  }

  async OnContact(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: ctx.from.id },
    });
    if (!user) {
      if ('contact' in ctx.message) {
        if (ctx.message.contact.user_id !== ctx.from.id) {
          await ctx.reply("O'zingizning raqamingizni yuboring.");
        } else {
          const newUser = await this.userRepo.create({
            user_id: ctx.from.id,
            username: ctx.from.username,
            nickname: ctx.from.first_name,
            phone_number: ctx.message.contact.phone_number,
          });
          await ctx.reply(
            "Tabriklaymiz siz muvaffaqiyatli ro'yhatdan o'tdingiz, \nEndi botdan bemalol foydalanishingiz mumkin.",
          );
          await this.kerakliBolimlar(ctx);
        }
      }
    } else {
      await ctx.reply('Sizning raqamingiz allaqachon saqlangan.');
    }
  }

  async hearsGuruhOchish(ctx: Context) {
    const group = await this.groupRepo.findOne({
      where: { teacher_id: ctx.from.id },
    });
    if (group) {
      await group.destroy();
    }
    const pupil = await this.pupilRepo.findOne({
      where: { student_id: ctx.from.id },
    });
    if (pupil) {
      await pupil.destroy();
    }
    const member = await this.memberRepo.findOne({
      where: { user_id: ctx.from.id },
    });
    if (member) {
      await member.destroy();
    }
    await this.groupRepo.create({ teacher_id: ctx.from.id });
    await ctx.reply('Ok.Guruh nomini kiriting', {
      parse_mode: 'HTML',
      ...Markup.keyboard([['Tasodifiy guruh nomi 🎲'], ['Orqaga 🔙']])
        .oneTime()
        .resize(),
    });
  }

  async hearsGenerateGroupName(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: ctx.from.id },
    });
    if (!user) {
      await ctx.reply('/start');
    } else {
      await this.clearOldData(ctx, ctx.from.id);
      const newGroup = await this.groupRepo.create({
        teacher_id: ctx.from.id,
      });
      const groupName = await this.generateGroupName(newGroup.id);
      await this.updateGroupNameandSecretkey(ctx, groupName, newGroup.id);
    }
  }

  async hearsIfOnMessage(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: ctx.from.id },
    });
    if (user) {
      const pupil = await this.pupilRepo.findOne({
        where: { student_id: user.user_id },
      });
      const group = await this.groupRepo.findOne({
        where: { teacher_id: user.user_id },
      });
      if (pupil) {
        if (pupil && !pupil.key_for_connect) {
          if ('text' in ctx.message) {
            const group = await this.groupRepo.findOne({
              where: { secret_key: ctx.message.text },
            });
            if (group) {
              pupil.update({ key_for_connect: ctx.message.text });
              await pupil.save();
              await this.showToPupil(ctx);
            } else {
              await ctx.reply('Bunday kalitli guruh topilmadi');
            }
          } else {
            await ctx.reply('Nomalum tushunarsiz hato');
          }
        } else {
          await ctx.reply('Avvalgi guruhingiz muammo qilyapti');
        }
      } else {
        if ('text' in ctx.message) {
          await this.updateGroupNameandSecretkey(
            ctx,
            String(ctx.message.text),
            group.id,
          );
        } else {
          await ctx.reply('/start notanish hatolik');
        }
      }
    } else {
      await ctx.reply('/start bu habar royhatdan otmagan odamga yuboriladi');
    }
  }

  async hearsGuruhgaKirish(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: ctx.from.id },
    });
    if (!user) {
      await ctx.reply('/start');
    } else {
      await this.clearOldData(ctx, user.user_id);
      await this.pupilRepo.create({ student_id: ctx.from.id });
      await ctx.reply("Kalit so'zni kiriting");
    }
  }

  async hearsOrqaga(ctx: Context) {
    await this.kerakliBolimlar(ctx);
  }

  async updateGroupNameandSecretkey(
    ctx: Context,
    groupName: string,
    id: number,
  ) {
    const group = await this.groupRepo.findOne({ where: { id: id } });

    let secretKey = await this.generateSecretkey();
    while (await this.groupRepo.findOne({ where: { secret_key: secretKey } })) {
      secretKey = await this.generateSecretkey();
    }

    group.update({
      group_name: groupName,
      secret_key: secretKey,
    });
    await group.save();
    console.log(group);
    await ctx.reply('tayyor');
    await this.showToteacher(ctx, group.teacher_id);
  }

  async showToPupil(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: ctx.from.id },
    });
    if (user) {
      const pupil = await this.pupilRepo.findOne({
        where: { student_id: user.user_id },
      });
      console.log(pupil);
      const group = await this.groupRepo.findOne({
        where: { secret_key: pupil.key_for_connect },
      });
      console.log(group);
      const teacher = await this.userRepo.findOne({
        where: { user_id: group.teacher_id },
      });
      if (pupil) {
        const user = await this.userRepo.findOne({
          where: { user_id: pupil.student_id },
        });
        let groupInfo = `👨‍🏫 O'qutuvchi: ${teacher.nickname} \n👥 Guruh nomi: ${
          group.group_name
        } \n🔐kalit so'z: ${
          group.secret_key
        } \n📅Ohirgi yangilanish - ${new Date()
          .toString()
          .split(' ')
          .slice(0, 6)
          .join(' ')} \n\n`;

        let bool = pupil.is_ready == true ? '✅' : '❌';
        let pupilInfo = `${user.nickname} - ${bool}\n`;
        const message = await ctx.reply(groupInfo + pupilInfo, {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            Markup.button.callback('Exit 🔚', 'exitingroup'),
            Markup.button.callback("I'm Ready ✅", 'iready'),
            Markup.button.callback('Not Yet ❌', 'notready'),
          ]),
        });
        await this.memberRepo.create({
          user_id: pupil.student_id,
          message_id: message.message_id,
        });
        await this.showToAll(ctx);
      } else {
        await ctx.reply('/start 41');
      }
    } else {
      await ctx.reply('/start bu user yoqligi uchun qaytdi');
    }
  }

  async showToteacher(ctx: Context, teacher_id: number) {
    try {
      const group = await this.groupRepo.findOne({
        where: { teacher_id: teacher_id },
      });
      const teacher = await this.userRepo.findOne({
        where: { user_id: group.teacher_id },
      });
      const pupils = await this.pupilRepo.findAll({
        where: { key_for_connect: group.secret_key },
      });
      if (!group) {
        await ctx.reply('/start');
      } else {
        let groupInfo = `👨‍🏫 O'qutuvchi: ${teacher.nickname} \n👥 Guruh nomi: ${group.group_name} \n🔐kalit so'z: ${group.secret_key} \n\n`;
        groupInfo += `O'quvchilar:\n`;
        for (let el of pupils) {
          const user = await this.userRepo.findOne({
            where: { user_id: el.student_id },
          });
          let bool = el.is_ready == true ? '✅' : '❌';
          groupInfo += `${user.nickname} - ${bool}\n`;
        }
        console.log(groupInfo);
        const message = await ctx.reply(groupInfo, {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            Markup.button.callback('End 🔚', 'endthisgroup'),
            Markup.button.callback('Update 🔄', 'updatepupilsready'),
            Markup.button.callback('User 🪓', `deleteuserinthisgroup`),
          ]),
        });
        await this.memberRepo.create({
          user_id: ctx.from.id,
          message_id: message.message_id,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async hearsEndGroup(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: ctx.from.id },
    });
    if (!user) {
      await ctx.reply('/start');
    } else {
      const group = await this.groupRepo.findOne({
        where: { teacher_id: ctx.from.id },
      });
      if (!group) {
        await ctx.reply('/start 1');
      } else {
        await group.destroy();
        await ctx.reply(
          "Guruh muvaffaqqiyatli o'chirildi.\nBotdan foydalanganingiz uchun rahmat",
        );
      }
    }
  }

  async hearsTeacherUpdatePupilsIsReady(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: ctx.from.id },
    });
    if (!user) {
      await ctx.reply('/start');
    } else {
      const group = await this.groupRepo.findOne({
        where: { teacher_id: ctx.from.id },
      });
      if (!group) {
        await ctx.reply('/start 1');
      } else {
        await ctx.telegram;
        const pupils = await this.pupilRepo.findAll({
          where: { key_for_connect: group.secret_key },
        });
        let groupInfo = `👨‍🏫 O'qutuvchi: ${user.nickname} \n👥 Guruh nomi: ${
          group.group_name
        } \n🔐kalit so'z: ${
          group.secret_key
        }\n📅Ohirgi yangilanish - ${new Date()
          .toString()
          .split(' ')
          .slice(0, 6)
          .join(' ')} \n\n`;
        let groupInfoToAdmin = groupInfo + `O'quvchilar:\n`;
        for (let pupil of pupils) {
          pupil.is_ready = false;
          await pupil.save();
        }
        for (let pupil of pupils) {
          const member = await this.memberRepo.findOne({
            where: { user_id: pupil.student_id },
          });
          const user = await this.userRepo.findOne({
            where: { user_id: pupil.student_id },
          });
          let bool = pupil.is_ready == true ? '✅' : '❌';
          let res = `${user.nickname} - ${bool}\n`;
          groupInfoToAdmin += res;
          if (member) {
            await ctx.telegram.editMessageText(
              member.user_id,
              member.message_id,
              null,
              groupInfo + res,
              {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                  Markup.button.callback('Exit 🔚', 'exitingroup'),
                  Markup.button.callback("I'm Ready ✅", 'iready'),
                  Markup.button.callback('Not Yet ❌', 'notready'),
                ]),
              },
            );
          }
        }
        const teacherMember = await this.memberRepo.findOne({
          where: { user_id: group.teacher_id },
        });
        await ctx.telegram.editMessageText(
          teacherMember.user_id,
          teacherMember.message_id,
          null,
          groupInfoToAdmin,
          {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
              Markup.button.callback('End 🔚', 'endthisgroup'),
              Markup.button.callback('Update 🔄', 'updatepupilsready'),
              Markup.button.callback('User 🪓', `deleteuserinthisgroup`),
            ]),
          },
        );
      }
    }
  }

  async iReady(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: ctx.from.id },
    });
    if (user) {
      const pupil = await this.pupilRepo.findOne({
        where: { student_id: user.user_id },
      });
      if (pupil) {
        if (!pupil.is_ready) {
          pupil.update({ is_ready: true });
          await pupil.save();
          await this.showToAll(ctx);
        }
      } else {
        await ctx.reply(
          '/start bu user bor lekin guruhga ulanmaganligi uchun qaytdi',
        );
      }
    } else {
      await ctx.reply('/start user yoqligi uchun qaytdi');
    }
  }

  async notReady(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: ctx.from.id },
    });
    if (user) {
      const pupil = await this.pupilRepo.findOne({
        where: { student_id: user.user_id },
      });
      if (pupil) {
        if (pupil.is_ready) {
          pupil.update({ is_ready: false });
          await pupil.save();
          await this.showToAll(ctx);
        } else {
          null;
        }
      } else {
        await ctx.reply(
          '/start bu tayyor emasman actionni ishlatdi lekin guruhda yoqligi uchun qaytdi',
        );
      }
    } else {
      await ctx.reply('/start user yoqligi uchun qaytdi');
    }
  }

  async showToAll(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: ctx.from.id },
    });
    if (user) {
      const group = await this.groupRepo.findOne({
        where: { teacher_id: user.user_id },
      });
      if (group) {
        let groupInfo = `👨‍🏫 O'qutuvchi: ${user.nickname} \n👥 Guruh nomi: ${
          group.group_name
        } \n🔐Kalit so'z: ${
          group.secret_key
        } \n📅Ohirgi yangilanish - ${new Date()
          .toString()
          .split(' ')
          .slice(0, 6)
          .join(' ')}\n\n`;
        let students = "O'quvchilar 👇\n";
        const pupils = await this.pupilRepo.findAll({
          where: { key_for_connect: group.secret_key },
        });
        let pupilsInfo = '';
        if (pupils.length) {
          for (let pupil of pupils) {
            const user = await this.userRepo.findOne({
              where: { user_id: pupil.student_id },
            });
            if (user) {
              let bool = pupil.is_ready == true ? '✅' : '❌';
              let res = `${user.nickname} - ${bool}\n`;
              pupilsInfo += res;
            }
          }
        } else {
          pupilsInfo = `Hozircha hechkim yo'q`;
        }
        const teacherMember = await this.memberRepo.findOne({
          where: { user_id: group.teacher_id },
        });
        if (teacherMember) {
          await ctx.telegram.editMessageText(
            teacherMember.user_id,
            teacherMember.message_id,
            null,
            groupInfo + students + pupilsInfo,
            {
              parse_mode: 'HTML',
              ...Markup.inlineKeyboard([
                Markup.button.callback('End 🔚', 'endthisgroup'),
                Markup.button.callback('Update 🔄', 'updatepupilsready'),
                Markup.button.callback('User 🪓', `deleteuserinthisgroup`),
              ]),
            },
          );
        } else {
          await ctx.reply(
            '/start guruh ochgan, lekin member tableda malumotlari bolmaganligi uchun qaytdi',
          );
        }
        for (let pupil of pupils) {
          const pupilMember = await this.memberRepo.findOne({
            where: { user_id: pupil.student_id },
          });
          if (pupilMember) {
            await ctx.telegram.editMessageText(
              pupilMember.user_id,
              pupilMember.message_id,
              null,
              groupInfo + students + pupilsInfo,
              {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                  Markup.button.callback('Exit 🔚', 'exitingroup'),
                  Markup.button.callback("I'm Ready ✅", 'iready'),
                  Markup.button.callback('Not Yet ❌', 'notready'),
                ]),
              },
            );
          }
        }
      } else {
        const pupil = await this.pupilRepo.findOne({
          where: { student_id: user.user_id },
        });
        if (pupil) {
          const group = await this.groupRepo.findOne({
            where: { secret_key: pupil.key_for_connect },
          });
          if (group) {
            const teacher = await this.userRepo.findOne({
              where: { user_id: group.teacher_id },
            });
            let groupInfo = `👨‍🏫 O'qutuvchi: ${
              teacher.nickname
            } \n👥 Guruh nomi: ${group.group_name} \n🔐Kalit so'z: ${
              group.secret_key
            } \n📅Ohirgi yangilanish - ${new Date()
              .toString()
              .split(' ')
              .slice(0, 6)
              .join(' ')}\n\n`;
            let students = "O'quvchilar 👇\n";

            const pupils = await this.pupilRepo.findAll({
              where: { key_for_connect: group.secret_key },
            });
            let pupilsInfo = '';
            if (pupils.length) {
              for (let pupil of pupils) {
                const user = await this.userRepo.findOne({
                  where: { user_id: pupil.student_id },
                });
                if (user) {
                  let bool = pupil.is_ready == true ? '✅' : '❌';
                  let res = `${user.nickname} - ${bool}\n`;
                  pupilsInfo += res;
                }
              }
            } else {
              pupilsInfo = `Hozircha hechkim yo'q`;
            }
            if (teacher) {
              const teacherMember = await this.memberRepo.findOne({
                where: { user_id: teacher.user_id },
              });
              if (teacherMember) {
                await ctx.telegram.editMessageText(
                  teacherMember.user_id,
                  teacherMember.message_id,
                  null,
                  groupInfo + students + pupilsInfo,
                  {
                    parse_mode: 'HTML',
                    ...Markup.inlineKeyboard([
                      Markup.button.callback('End 🔚', 'endthisgroup'),
                      Markup.button.callback('Update 🔄', 'updatepupilsready'),
                      Markup.button.callback(
                        'User 🪓',
                        `deleteuserinthisgroup`,
                      ),
                    ]),
                  },
                );
              }
            }
            for (let pupil of pupils) {
              const pupilMember = await this.memberRepo.findOne({
                where: { user_id: pupil.student_id },
              });
              if (pupilMember) {
                await ctx.telegram.editMessageText(
                  pupilMember.user_id,
                  pupilMember.message_id,
                  null,
                  groupInfo + students + pupilsInfo,
                  {
                    parse_mode: 'HTML',
                    ...Markup.inlineKeyboard([
                      Markup.button.callback('Exit 🔚', 'exitingroup'),
                      Markup.button.callback("I'm Ready ✅", 'iready'),
                      Markup.button.callback('Not Yet ❌', 'notready'),
                    ]),
                  },
                );
              }
            }
          } else {
            await ctx.reply(
              '/start bu user bor student bor lekin guruh yoqligi uchun qaytdi',
            );
          }
        } else {
          await ctx.reply(
            '/start na guruh ochgan na guruhda borligi uchun qaytdi',
          );
        }
      }
    } else {
      await ctx.reply('/start user yoqligi uchun qaytdi');
    }
  }

  async exitInGroup(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: ctx.from.id },
    });
    if (user) {
      const pupil = await this.pupilRepo.findOne({
        where: { student_id: user.user_id },
      });
      if (pupil) {
        await pupil.destroy();
        await ctx.reply('Siz guruhdan muvaffaqqiyatli chiqdingiz');
        await this.whenPupilExitGroup(ctx, pupil.key_for_connect);
      } else {
        await ctx.reply(
          '/start user bor lekin student tableda yoqligi uchun qaytdi',
        );
      }
    } else {
      await ctx.reply('/start bu user bazada yoqligi uchun qaytdi');
    }
  }

  async hearsDeleteusersInGroup() {}
  async generateGroupName(id: number) {
    const groupName = 'GROUP' + id;
    console.log(groupName);
    return groupName;
  }

  async whenPupilExitGroup(ctx: Context, secretKey: string) {
    const group = await this.groupRepo.findOne({
      where: { secret_key: secretKey },
    });
    const teacher = await this.userRepo.findOne({
      where: { user_id: group.teacher_id },
    });
    const pupils = await this.pupilRepo.findAll({
      where: { key_for_connect: group.secret_key },
    });
    let groupInfo = `👨‍🏫 O'qutuvchi: ${teacher.nickname} \n👥 Guruh nomi: ${
      group.group_name
    } \n🔐Kalit so'z: ${group.secret_key} \n📅Ohirgi yangilanish - ${new Date()
      .toString()
      .split(' ')
      .slice(0, 6)
      .join(' ')}\n\n`;
    let students = "O'quvchilar 👇\n";
    let pupilsInfo = '';
    if (pupils.length) {
      for (let pupil of pupils) {
        const user = await this.userRepo.findOne({
          where: { user_id: pupil.student_id },
        });
        if (user) {
          let bool = pupil.is_ready == true ? '✅' : '❌';
          let res = `${user.nickname} - ${bool}\n`;
          pupilsInfo += res;
        }
      }
    } else {
      pupilsInfo = `Hozircha hechkim yo'q`;
    }
    if (teacher) {
      const teacherMember = await this.memberRepo.findOne({
        where: { user_id: teacher.user_id },
      });
      if (teacherMember) {
        await ctx.telegram.editMessageText(
          teacherMember.user_id,
          teacherMember.message_id,
          null,
          groupInfo + students + pupilsInfo,
          {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
              Markup.button.callback('End 🔚', 'endthisgroup'),
              Markup.button.callback('Update 🔄', 'updatepupilsready'),
              Markup.button.callback('User 🪓', `deleteuserinthisgroup`),
            ]),
          },
        );
      }
    }
    for (let pupil of pupils) {
      const pupilMember = await this.memberRepo.findOne({
        where: { user_id: pupil.student_id },
      });
      if (pupilMember) {
        await ctx.telegram.editMessageText(
          pupilMember.user_id,
          pupilMember.message_id,
          null,
          groupInfo + students + pupilsInfo,
          {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
              Markup.button.callback('Exit 🔚', 'exitingroup'),
              Markup.button.callback("I'm Ready ✅", 'iready'),
              Markup.button.callback('Not Yet ❌', 'notready'),
            ]),
          },
        );
      }
    }
  }

  async kerakliBolimlar(ctx: Context) {
    await ctx.reply("O'zingizga kerakli bo'limni tanlang 👇", {
      parse_mode: 'HTML',
      ...Markup.keyboard([['Guruh ochish 👥'], ['Guruhga kirish 👤']])
        .oneTime()
        .resize(),
    });
  }

  async clearOldData(ctx: Context, id: number) {
    const group = await this.groupRepo.findOne({
      where: { teacher_id: id },
    });
    if (group) {
      await group.destroy();
    }
    const pupil = await this.pupilRepo.findOne({
      where: { student_id: id },
    });
    if (pupil) {
      await this.whenPupilExitGroup(ctx, pupil.key_for_connect);
      await pupil.destroy();
    }
    const member = await this.memberRepo.findOne({
      where: { user_id: id },
    });
    if (member) {
      await member.destroy();
    }
  }

  async generateSecretkey() {
    const secretkey = otpGe.generate(6, {
      upperCaseAlphabets: true,
      digits: true,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log(secretkey);
    return secretkey;
  }
}
