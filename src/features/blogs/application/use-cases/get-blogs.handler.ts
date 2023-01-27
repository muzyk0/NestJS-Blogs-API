import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PageOptionsDto } from '../../../../common/paginator/page-options.dto';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';

export class GetBlogsCommand {
  constructor(
    public readonly pageOptionsDto: PageOptionsDto,
    public readonly userId?: string | null,
    public readonly withBanned?: boolean,
  ) {}
}

@CommandHandler(GetBlogsCommand)
export class GetBlogsHandler implements ICommandHandler<GetBlogsCommand> {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  async execute({ pageOptionsDto, userId, withBanned }: GetBlogsCommand) {
    return this.blogsQueryRepository.findAll(
      pageOptionsDto,
      userId,
      withBanned,
    );
  }
}
