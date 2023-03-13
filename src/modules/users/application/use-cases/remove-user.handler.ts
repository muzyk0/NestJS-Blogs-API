import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  IUsersRepository,
  UsersRepository,
} from '../../infrastructure/users.repository.sql';

export class RemoveUserCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(RemoveUserCommand)
export class RemoveUserHandler implements ICommandHandler<RemoveUserCommand> {
  constructor(private readonly usersRepository: IUsersRepository) {}

  async execute({ userId }: RemoveUserCommand) {
    const user = await this.usersRepository.findOneById(userId);

    if (!user) {
      throw new NotFoundException();
    }

    return this.usersRepository.remove(userId);
  }
}
