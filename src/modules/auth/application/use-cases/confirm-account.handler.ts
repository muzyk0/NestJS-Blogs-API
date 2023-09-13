import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { isAfter } from 'date-fns';

import { IUsersRepository } from '../../../users/application/application/users-repository.abstract-class';
import { User } from '../../../users/domain/entities/user.entity';

export class ConfirmAccountCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmAccountCommand)
export class ConfirmAccountHandler
  implements ICommandHandler<ConfirmAccountCommand>
{
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute({ code }: ConfirmAccountCommand): Promise<boolean> {
    const user = await this.usersRepository.findOneByConfirmationCode(code);

    if (!this.isAvailableConfirmAccount(user, code)) {
      throw new BadRequestException([
        { message: "Code isn't correct", field: 'code' },
      ]);
    }

    return this.usersRepository.setIsConfirmedById(user!.id);
  }

  private isAvailableConfirmAccount(user: User | null, code: string) {
    if (!user) {
      return false;
    }
    if (this.isConfirmed(user)) {
      return false;
    }

    if (this.isExpired(user)) {
      return false;
    }

    if (!this.isValidConfirmationCode(user, code)) {
      return false;
    }

    return true;
  }

  private isConfirmed(user: User) {
    return user.isConfirmed;
  }

  private isExpired(user: User) {
    if (!user.expirationDate) {
      return false;
    }
    return isAfter(new Date(), user.expirationDate);
  }

  private isValidConfirmationCode(user: User, code: string) {
    return code === user.confirmationCode;
  }
}
