import { Update } from 'nestjs-telegraf';
import { UsersService } from './users.service';

@Update()
export class UsersUpdate {
  constructor(private readonly usersService: UsersService) {}
}
