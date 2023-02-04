import { Update } from 'nestjs-telegraf';
import { PupilService } from './pupil.service';

@Update()
export class PupilUpdate {
  constructor(private readonly pupilService: PupilService) {}
}
