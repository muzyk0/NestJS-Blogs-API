import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isAfter } from 'date-fns';

import { PasswordRecoveryService } from '../../../password-recovery/application/password-recovery.service';
import { UsersService } from '../../../users/application/users.service';
import { User } from '../../../users/domain/schemas/users.schema';

export class ConfirmAccountCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmAccountCommand)
export class ConfirmAccountHandler
  implements ICommandHandler<ConfirmAccountCommand>
{
  constructor(private readonly usersService: UsersService) {}

  async execute({ code }: ConfirmAccountCommand): Promise<boolean> {
    const user = await this.usersService.findOneByConfirmationCode(code);

    if (!this.isAvailableConfirmAccount(user, code)) {
      return false;
    }

    return this.usersService.setIsConfirmed(user.accountData.id);
  }

  private isAvailableConfirmAccount(user: User, code: string) {
    if (!user || this.isConfirmed(user)) {
      return false;
    }

    if (this.isExpired(user)) {
      return false;
    }

    if (!this.isValidConfirmationCode(user, code)) {
      return false;
    }
  }

  private isConfirmed(user: User) {
    return user.emailConfirmation.isConfirmed;
  }

  private isExpired(user: User) {
    return isAfter(new Date(), user.emailConfirmation.expirationDate);
  }

  private isValidConfirmationCode(user: User, code: string) {
    return code === user.emailConfirmation.confirmationCode;
  }
}
