import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PageOptionsForUserDto } from '../../../../common/paginator/page-options.dto';
import { UsersQueryRepository } from '../../infrastructure/users.query.repository';

export class GetUsersCommand {
  constructor(public readonly pageOptionsDto: PageOptionsForUserDto) {}
}

@CommandHandler(GetUsersCommand)
export class GetUsersHandler implements ICommandHandler<GetUsersCommand> {
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  async execute({ pageOptionsDto }: GetUsersCommand) {
    return this.usersQueryRepository.findAll(pageOptionsDto);
  }
}
