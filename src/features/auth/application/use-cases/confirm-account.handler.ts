import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isAfter } from 'date-fns';

import { PasswordRecoveryService } from '../../../password-recovery/application/password-recovery.service';
import { UsersService } from '../../../users/application/users.service';

export class ConfirmAccountCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmAccountCommand)
export class ConfirmAccountHandler
  implements ICommandHandler<ConfirmAccountCommand>
{
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordRecoveryService: PasswordRecoveryService,
  ) {}

  async execute({ code }: ConfirmAccountCommand): Promise<boolean> {
    const user = await this.usersService.findOneByConfirmationCode(code);
    if (!user || user.emailConfirmation.isConfirmed) {
      return false;
    }

    const isExpired = isAfter(
      new Date(),
      user.emailConfirmation.expirationDate,
    );

    if (isExpired) {
      return false;
    }

    if (code !== user.emailConfirmation.confirmationCode) {
      return false;
    }

    return this.usersService.setIsConfirmed(user.accountData.id);
  }
}
