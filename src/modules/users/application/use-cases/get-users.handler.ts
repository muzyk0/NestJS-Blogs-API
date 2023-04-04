import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PageOptionsForUserDto } from '../../../../shared/paginator/page-options.dto';
import { IUsersQueryRepository } from '../../controllers/interfaces/users-query-repository.abstract-class';

export class GetUsersCommand {
  constructor(public readonly pageOptionsDto: PageOptionsForUserDto) {}
}

@CommandHandler(GetUsersCommand)
export class GetUsersHandler implements ICommandHandler<GetUsersCommand> {
  constructor(private readonly usersQueryRepository: IUsersQueryRepository) {}

  async execute({ pageOptionsDto }: GetUsersCommand) {
    return this.usersQueryRepository.findAll(pageOptionsDto);
  }
}
