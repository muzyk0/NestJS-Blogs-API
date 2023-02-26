import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersRepository } from '../../../users/infrastructure/users.repository.sql';
import { IBlogsRepository } from '../../infrastructure/blogs.sql.repository';

export class BindBlogOnUserCommand {
  constructor(public readonly blogId: string, public readonly userId: string) {}
}

@CommandHandler(BindBlogOnUserCommand)
export class BindBlogOnUserHandler
  implements ICommandHandler<BindBlogOnUserCommand>
{
  constructor(
    private readonly blogsRepository: IBlogsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute({ blogId, userId }: BindBlogOnUserCommand) {
    const user = await this.usersRepository.findOneById(userId);

    if (!user) {
      throw new BadRequestException({
        field: 'userId',
        message: "User doesn't exist",
      });
    }

    return this.blogsRepository.bindBlogOnUser(blogId, userId);
  }
}
