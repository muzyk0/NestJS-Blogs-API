import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { addDays } from 'date-fns';
import { v4 } from 'uuid';

import { EmailServiceLocal } from '../../../email-local/application/email-local.service';
import {
  IUsersRepository,
  UsersRepository,
} from '../../../users/infrastructure/users.repository.sql';

export class ResendConfirmationCodeCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ResendConfirmationCodeCommand)
export class ResendConfirmationCodeHandler
  implements ICommandHandler<ResendConfirmationCodeCommand>
{
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly emailService: EmailServiceLocal,
  ) {}

  async execute({ email }: ResendConfirmationCodeCommand): Promise<boolean> {
    const user = await this.usersRepository.findOneByEmail(email);

    if (!user || user.isConfirmed) {
      return false;
    }

    const updatedUser = await this.usersRepository.updateConfirmationCode({
      id: user.id,
      code: v4(),
      expirationDate: addDays(new Date(), 1),
    });

    if (!updatedUser) {
      return false;
    }

    await this.emailService.SendConfirmationCode({
      email: email,
      userName: user.login,
      confirmationCode: updatedUser.confirmationCode,
    });
    return true;
  }
}
