import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PageOptionsDto } from '../../../../shared/paginator/page-options.dto';
import { IBlogsQueryRepository } from '../interfaces/blogs-query-repository.abstract-class';

export class GetBlogsForAdminCommand {
  constructor(public readonly pageOptionsDto: PageOptionsDto) {}
}

@CommandHandler(GetBlogsForAdminCommand)
export class GetBlogsForAdminHandler
  implements ICommandHandler<GetBlogsForAdminCommand>
{
  constructor(private readonly blogsQueryRepository: IBlogsQueryRepository) {}

  async execute({ pageOptionsDto }: GetBlogsForAdminCommand) {
    return this.blogsQueryRepository.findAllForAdmin(pageOptionsDto);
  }
}
