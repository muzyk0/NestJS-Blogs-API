import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  BlogExistsRule,
  IsUserAlreadyExistConstraint,
} from '../../shared/decorators/validations';
import { BlogsModule } from '../blogs/blogs.module';

import { UpdateBanUserForBlogHandler } from './application/use-cases';
import { Bans, BloggerBanUser } from './domain/entity';
import {
  BloggersBanUsersRepository,
  IBloggersBanUsersRepository,
  IUserBanRepository,
  UserBanRepository,
} from './infrastructure';

const CommandHandlers = [UpdateBanUserForBlogHandler];
const Providers: Provider[] = [
  {
    provide: IBloggersBanUsersRepository,
    useClass: BloggersBanUsersRepository,
  },
  {
    provide: IUserBanRepository,
    useClass: UserBanRepository,
  },
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([BloggerBanUser, Bans]),
    BlogsModule,
  ],
  controllers: [],
  providers: [
    IsUserAlreadyExistConstraint,
    BlogExistsRule,
    ...CommandHandlers,
    ...Providers,
  ],
  exports: [...CommandHandlers, ...Providers],
})
export class BansModule {}
