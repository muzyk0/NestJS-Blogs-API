import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { addDays } from 'date-fns';
import { v4 } from 'uuid';

import { EmailServiceLocal } from '../../../email-local/application/email-local.service';
import { UsersService } from '../../../users/application/users.service';

export class ResendConfirmationCodeCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ResendConfirmationCodeCommand)
export class ResendConfirmationCodeHandler
  implements ICommandHandler<ResendConfirmationCodeCommand>
{
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailServiceLocal,
  ) {}

  async execute({ email }: ResendConfirmationCodeCommand): Promise<boolean> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user || user.emailConfirmation.isConfirmed) {
      return false;
    }

    const updatedUser = await this.usersService.updateConfirmationCode({
      id: user.accountData.id,
      code: v4(),
      expirationDate: addDays(new Date(), 1),
    });

    if (!updatedUser) {
      return false;
    }

    await this.emailService.SendConfirmationCode({
      email: email,
      userName: user.accountData.login,
      confirmationCode: user.emailConfirmation.confirmationCode,
    });
    return true;
  }
}
